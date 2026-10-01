# 11 · Release QA checklist

Run top to bottom before any build goes to players. Record pass/fail and the build id.

## Plays right
- [ ] New player reaches the first goal without help in under 2 minutes
- [ ] Every verb has visual, audio and (where relevant) haptic feedback
- [ ] Death/failure restarts in under 3 seconds
- [ ] No soft-locks: try to get stuck on purpose in each level
- [ ] Difficulty curve: the first 5 minutes are easy, the rest escalates

## Runs right
- [ ] Holds target frame rate on the slowest supported device (low preset)
- [ ] No frame-time spikes over 50 ms during normal play
- [ ] Memory stays flat over a 30-minute session (no leak growth)
- [ ] Loading time under 5 s on a mid-range connection; progress is shown
- [ ] Tab hidden → returns without a burst of catch-up or stuck audio

## Works everywhere
- [ ] Latest Chrome, Safari, Firefox, and one mobile browser
- [ ] Window resize, orientation change, DPR change handled
- [ ] Keyboard, mouse, touch and (if promised) gamepad all work; no stuck keys after focus loss
- [ ] Remappable or at least discoverable controls

## Accessible
- [ ] Text readable at phone size; contrast meets WCAG AA
- [ ] Information never carried by colour alone
- [ ] Sound is not required to play; subtitles for spoken lines
- [ ] Reduce-motion option disables shake, flashes and parallax
- [ ] No flashing faster than 3 times per second

## Safe
- [ ] Client is never trusted for scores, currency or unlocks — the server validates
- [ ] Inputs sanitised; saves can't be edited to crash or grant rewards
- [ ] No secrets or API keys in shipped code
- [ ] Rate limits on anything that costs money or hits an external service
- [ ] Privacy: only collect what's needed; say what and why

## Release hygiene
- [ ] Version number visible in the menu
- [ ] Error reporting wired; test error shows up
- [ ] Rollback plan: the previous build is one step away
- [ ] Known issues list written, even if short

## Automated checks worth having
- Deterministic simulation test: run N ticks from a seed, assert a hash of final state.
- Collision unit tests (floors, walls, corners, fast movers).
- A "monkey" run: random inputs for 5 minutes must not crash.
