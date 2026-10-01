// Fixed-timestep loop driver (NEXUS). Simulation always advances in equal slices;
// rendering gets an interpolation factor so motion stays smooth at any display rate.
//
//   const loop = new FixedStep({ hz: 60, update: (dt) => world.step(dt), render: (alpha) => draw(alpha) });
//   requestAnimationFrame(function frame(now) { loop.tick(now / 1000); requestAnimationFrame(frame); });
//
// maxCatchUp stops the "spiral of death": after a long stall (tab hidden, debugger)
// the game drops the backlog instead of trying to simulate minutes at once.

export class FixedStep {
  constructor({ hz = 60, maxCatchUp = 0.25, update, render }) {
    this.step = 1 / hz;
    this.maxCatchUp = maxCatchUp;
    this.update = update;
    this.render = render;
    this.acc = 0;
    this.last = null;
    this.ticks = 0;
  }
  tick(nowSeconds) {
    if (this.last === null) this.last = nowSeconds;
    let frame = nowSeconds - this.last;
    this.last = nowSeconds;
    if (frame > this.maxCatchUp) frame = this.maxCatchUp;
    this.acc += frame;
    while (this.acc >= this.step) { this.update(this.step); this.acc -= this.step; this.ticks++; }
    this.render(this.acc / this.step);
  }
}

// Blend between the previous and current simulated value for drawing.
export const blend = (prev, curr, alpha) => prev + (curr - prev) * alpha;
