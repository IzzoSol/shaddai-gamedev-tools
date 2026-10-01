# 08 · 2D sprites and animation

## Sheet layout
Put a character's frames in a **grid**: one row per action (idle, walk, jump, attack), one column per frame. Equal cell size, transparent background, feet on the same baseline in every frame so the character doesn't bob when clips switch.

```js
import { gridSheet, clip } from './runtime/clips.mjs';
const sheet = gridSheet({ cols: 8, rows: 4, frameW: 64, frameH: 64 });
const clips = {
  idle:   clip(sheet, { row: 0, from: 0, to: 3, fps: 6,  mode: 'loop' }),
  run:    clip(sheet, { row: 1, from: 0, to: 7, fps: 14, mode: 'loop' }),
  attack: clip(sheet, { row: 2, from: 0, to: 5, fps: 18, mode: 'once' }),
};
const frame = clips[state].at(timeInState);        // → { x, y, w, h, u, v, uw, vh }
```
Clips are pure functions of time, so pausing, slow-motion and replay need no extra state.

## Drawing
- **Canvas 2D:** `ctx.drawImage(img, f.x, f.y, f.w, f.h, dx, dy, f.w, f.h)`; set `ctx.imageSmoothingEnabled = false` for crisp pixel art.
- **three.js:** a plane with a `MeshBasicMaterial`, `transparent: true`; set the texture's `repeat` to `(f.uw, f.vh)` and `offset` to `(f.u, f.v)`. Use `NearestFilter` for pixel art.

## State machine, not flags
Drive the clip from a state (`idle → run → jump → fall → land`). On state change reset `timeInState` to 0. Transitions are explicit; no tangle of booleans.

## Timing feel
- 8–14 fps reads as hand-drawn and charming; 24+ looks smooth but costs more art.
- Hold the **contact frame** of attacks a beat longer; it sells impact more than extra frames do.
- Anticipation (a small wind-up) + follow-through (a settle) matter more than frame count.

## Pixel art at any screen size
Render the game at a small fixed resolution (e.g. 320×180) and scale the canvas by an **integer** factor. Non-integer scaling shimmers.

## Layering
Draw by **y-order** in top-down games (lower on screen = in front). Separate parallax layers move at fractions of camera speed (far = 0.2, mid = 0.5, near = 1.0).

## Production tips
- Keep a source layered file per character; export sheets by script so a tweak is one command.
- Name clips consistently across characters (`idle`, `run`, `attack`) so the same controller code drives any of them.
- Generated art needs the same checks as hand-drawn: consistent baseline, consistent palette, no stray edge pixels.
