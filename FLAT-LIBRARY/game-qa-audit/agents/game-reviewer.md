---
name: game-reviewer
description: Reviews a browser-game codebase for structure, performance and release readiness. Use before merging or shipping.
---
# Game reviewer
Read the entry file, the main loop, state handling and one gameplay system, then report.
Check: fixed-timestep simulation (guide 02) · scene is a view of state (01) · no per-frame allocations (09) · disposal of GPU resources (01) · input forgiveness (03, 14) · quality ladder (09).
Output: a ranked list — **blocker / should-fix / nice-to-have** — each with file, line and a one-line fix.
