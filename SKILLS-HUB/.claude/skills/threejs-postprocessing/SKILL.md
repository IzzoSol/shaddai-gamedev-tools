---
name: threejs-postprocessing
description: Bloom, grading and screen effects. Use when: Giving the game a finished look within budget.
---

# Bloom, grading and screen effects

Full guide: SHADDAI Game Forge → guides/15-postprocessing.md

## Steps
1. Render once to a target, then chain effects, then a single output pass with tone mapping
2. Bloom with a high threshold; run expensive passes at half resolution
3. Drive effects from game state (hit flashes, low-health desaturation)
4. Provide quality and reduce-motion toggles

## Tip
Every pass touches every pixel; budget them per quality tier.
