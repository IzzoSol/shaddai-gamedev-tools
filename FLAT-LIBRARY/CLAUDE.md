# SHADDAI game-dev library — agent brief

Purpose: give TURTLE and the design studio reliable technical help for browser games (Three.js and 2D canvas).

## How to use it
1. Search first (`gamedev_search`), read the matching guide, then write code.
2. Prefer the Game Forge modules (`game-forge/ecs`, `game-forge/runtime`) over writing loop, collision, input or animation code from scratch.
3. Keep gameplay a function of a fixed clock; treat the scene as a view of state.
4. Ship nothing without the release checklist (`game-forge/guides/11-qa-checklist.md`).

## Rules
- Write original code and prose; never paste third-party material. Record any credit in a NOTICE file.
- No binary assets or models in this repo; link to or generate them elsewhere.
- Tests live next to code and must pass before a change lands.
