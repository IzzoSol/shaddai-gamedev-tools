---
name: game-qa-mobile
description: Mobile-specific QA for browser games. Use when: shipping or reviewing a game for phones and tablets.
---

# game-qa-mobile

Full guide: SHADDAI Game Forge → guides/11-qa-checklist.md and guides/09-performance.md

## Steps
1. Test on a real mid-range phone, not only an emulator
2. Cap pixel ratio and use the Low quality preset; confirm a steady frame rate for 5 minutes
3. Touch controls: hit areas of at least 44 px, no hover dependence, touch-action: none on the canvas
4. Check orientation changes, safe-area insets and the on-screen keyboard
5. Check memory over 30 minutes and recovery after the tab is backgrounded
6. Verify audio starts only after a user gesture

## Tip
Phones throttle when hot: test the third minute, not the first.
