# 10 · Running a game project

A small game is a sequence of decisions made in a good order. This is SHADDAI's order.

## Roles (people or agents)
| Role | Owns | SHADDAI agent |
|---|---|---|
| Director | the one-sentence pitch, scope, final call | SHADDAI |
| Engineer | loop, systems, tools, performance | NEXUS |
| Designer | rules, balance, level flow, onboarding | ORACLE |
| Artist | look, characters, UI, animation | TURTLE |
| Writer | text, tutorials, store copy | QUILL |
| QA / security | breakage, exploits, cheating, privacy | PIKADON |
| Economy | pricing, rewards, sinks and sources | ZEROX |

One person can wear several hats. The point is that every decision has an owner.

## Gates — don't skip a gate to save a day
1. **Pitch.** One sentence: *who* does *what* and why it's fun. If it needs two sentences it is two games.
2. **Core loop prototype.** Grey boxes, one mechanic, 30 seconds of play. If this isn't fun, stop or change it; art can't rescue it.
3. **Vertical slice.** One short level at final quality — art, sound, UI, feel. It sets the bar for everything else.
4. **Content pass.** Build the remaining levels, enemies and items using the systems the slice proved.
5. **Polish and balance.** Feel, difficulty curve, onboarding, performance ladder.
6. **Release candidate.** Feature freeze. Only fixes. Run the QA checklist (guide 11).
7. **Ship and listen.** Instrument it, read feedback, patch in small steps.

## Design document: one page
- Pitch (one sentence) · target player · platform and input
- Core loop (verbs → feedback → goal)
- Failure and restart (how quickly, how kindly)
- Progression (what changes over time)
- Scope list: **must**, **should**, **could**. Cut from the bottom first.
- Risks (the three things most likely to sink it) and how you'll test each early

## Scope control
- Estimate in days, then double it.
- Every new idea goes on the "could" list, not into the build.
- A feature that needs a new system, new art and new UI at once is three features.

## Playtesting
Watch someone play without helping. Note where they hesitate, where they laugh, where they quit. Five players find most problems. Fix the problem you saw, not the solution they suggested.

## Working with agents
Give each agent a role, a gate, and a definition of done. Hand work over as files (design doc, shot list, asset list), not chat. Have a different agent review than the one that built.
