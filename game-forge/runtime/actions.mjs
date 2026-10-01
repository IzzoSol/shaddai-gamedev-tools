// Input actions with forgiveness windows (NEXUS).
// Game code asks "was jump pressed recently?" instead of reading raw keys, which is what
// makes platformers feel fair: a jump pressed a few frames early still counts (buffer),
// and a jump a few frames after leaving a ledge still works (coyote time).
//
//   const input = new Actions({ bufferMs: 120 });
//   window.onkeydown = (e) => input.press(bindings[e.code], performance.now());
//   // each simulation tick:
//   if (input.consume('jump', now) && (onGround || now - lastGrounded <= COYOTE_MS)) jump();

export class Actions {
  constructor({ bufferMs = 120 } = {}) { this.bufferMs = bufferMs; this.pressedAt = new Map(); this.held = new Set(); }
  press(action, nowMs) { if (!action) return; this.pressedAt.set(action, nowMs); this.held.add(action); }
  release(action) { this.held.delete(action); }
  isHeld(action) { return this.held.has(action); }
  // True once per press, as long as it happened within the buffer window.
  consume(action, nowMs) {
    const at = this.pressedAt.get(action);
    if (at === undefined || nowMs - at > this.bufferMs) return false;
    this.pressedAt.delete(action);
    return true;
  }
  // Movement axis from two held actions: -1, 0, or 1.
  axis(negative, positive) { return (this.held.has(positive) ? 1 : 0) - (this.held.has(negative) ? 1 : 0); }
}
