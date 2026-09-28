import Phaser from 'phaser';
import { PARTICLES, EFFECTS, GAME, PX } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';

/**
 * VisualEffects — manages all particle effects, screen shake, screen flash,
 * floating score text, and engine trail particles.
 *
 * Listens to EventBus for triggers; never imports entities directly.
 */
export class VisualEffects {
  constructor(scene) {
    this.scene = scene;
    this.trailParticles = [];
    this.activeParticles = [];
    // Throttle engine trail to every ~50ms to avoid spawning too many particles
    this._lastTrailTime = 0;
    this._trailInterval = 50;

    this._bindListeners();
  }

  _bindListeners() {
    this._onScreenShake = ({ intensity, duration }) => {
      this.scene.cameras.main.shake(
        duration || EFFECTS.SHAKE_DURATION,
        intensity || EFFECTS.SHAKE_INTENSITY
      );
    };

    this._onScreenFlash = ({ duration, r, g, b }) => {
      this.scene.cameras.main.flash(
        duration || EFFECTS.FLASH_DURATION,
        r ?? EFFECTS.FLASH_COLOR.r,
        g ?? EFFECTS.FLASH_COLOR.g,
        b ?? EFFECTS.FLASH_COLOR.b
      );
    };

    this._onFloatText = ({ x, y, text, color, duration }) => {
      this.spawnFloatText(x, y, text, color, duration);
    };

    this._onEngineTrail = ({ x, y }) => {
      const now = performance.now();
      if (now - this._lastTrailTime < this._trailInterval) return;
      this._lastTrailTime = now;
      this.spawnEngineTrail(x, y);
    };

    this._onParticlesEmit = ({ x, y, config }) => {
      this.emitBurst(x, y, config);
    };

    this._onScoreChanged = ({ score, x, y }) => {
      // Floating "+1" near where the asteroid passed off-screen
      const fx = x != null ? x : Phaser.Math.Between(Math.round(GAME.WIDTH * 0.3), Math.round(GAME.WIDTH * 0.7));
      const fy = (y != null ? y : GAME.HEIGHT) - 30 * PX;
      this.spawnFloatText(fx, fy, '+1', EFFECTS.FLOAT_TEXT.COLOR, EFFECTS.FLOAT_TEXT.DURATION);
      // Score sparkle particles at the same location
      this.emitBurst(fx, fy + 10 * PX, PARTICLES.SCORE_SPARKLE);
    };

    this._onShipHit = ({ x, y }) => {
      // Death burst particles
      this.emitBurst(x, y, PARTICLES.DEATH_BURST);
      // Screen shake
      eventBus.emit(Events.SCREEN_SHAKE, {
        intensity: EFFECTS.SHAKE_INTENSITY,
        duration: EFFECTS.SHAKE_DURATION,
      });
      // Screen flash
      eventBus.emit(Events.SCREEN_FLASH, {
        duration: EFFECTS.FLASH_DURATION,
      });
    };

    this._onAsteroidPassed = (data) => {
      // Small debris burst where the asteroid passed off-screen
      const x = data?.x != null ? data.x : Phaser.Math.Between(Math.round(GAME.WIDTH * 0.1), Math.round(GAME.WIDTH * 0.9));
      this.emitBurst(x, GAME.HEIGHT + 5, PARTICLES.DEBRIS);
    };

    eventBus.on(Events.SCREEN_SHAKE, this._onScreenShake);
    eventBus.on(Events.SCREEN_FLASH, this._onScreenFlash);
    eventBus.on(Events.FLOAT_TEXT, this._onFloatText);
    eventBus.on(Events.ENGINE_TRAIL, this._onEngineTrail);
    eventBus.on(Events.PARTICLES_EMIT, this._onParticlesEmit);
    eventBus.on(Events.SCORE_CHANGED, this._onScoreChanged);
    eventBus.on(Events.SHIP_HIT, this._onShipHit);
    eventBus.on(Events.ASTEROID_PASSED, this._onAsteroidPassed);
  }

  /**
   * Spawn a floating text that rises and fades out.
   */
  spawnFloatText(x, y, text, color, duration) {
    const fontSize = Math.round(GAME.HEIGHT * EFFECTS.FLOAT_TEXT.FONT_SIZE_RATIO);
    const floater = this.scene.add.text(x, y, text, {
      fontSize: fontSize + 'px',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      color: color || EFFECTS.FLOAT_TEXT.COLOR,
      fontStyle: 'bold',
      stroke: EFFECTS.FLOAT_TEXT.STROKE,
      strokeThickness: EFFECTS.FLOAT_TEXT.STROKE_THICKNESS,
    }).setOrigin(0.5).setDepth(100);

    this.scene.tweens.add({
      targets: floater,
      y: y - EFFECTS.FLOAT_TEXT.RISE,
      alpha: 0,
      scale: 1.3,
      duration: duration || EFFECTS.FLOAT_TEXT.DURATION,
      ease: 'Quad.easeOut',
      onComplete: () => floater.destroy(),
    });
  }

  /**
   * Spawn engine trail particles behind the ship.
   * Called from the scene update loop.
   */
  spawnEngineTrail(x, y) {
    const cfg = PARTICLES.ENGINE_TRAIL;
    for (let i = 0; i < cfg.COUNT; i++) {
      const px = x + Phaser.Math.FloatBetween(-cfg.SPREAD, cfg.SPREAD);
      const py = y + Phaser.Math.FloatBetween(0, 5 * PX);
      const size = Phaser.Math.FloatBetween(cfg.MIN_SIZE, cfg.MAX_SIZE);
      const color = Phaser.Utils.Array.GetRandom(cfg.COLORS);

      const particle = this.scene.add.circle(px, py, size, color, 0.8);
      particle.setDepth(5);

      this.scene.tweens.add({
        targets: particle,
        y: py + cfg.SPEED * (cfg.LIFETIME / 1000),
        alpha: 0,
        scale: 0.1,
        duration: cfg.LIFETIME,
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  /**
   * Emit a burst of particles at (x, y) using the given config.
   */
  emitBurst(x, y, config) {
    const count = config.COUNT || 8;
    const colors = config.COLORS || [0xffffff];

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Phaser.Math.FloatBetween(-0.3, 0.3);
      const speed = Phaser.Math.FloatBetween(config.SPEED * 0.5, config.SPEED);
      const size = Phaser.Math.FloatBetween(config.MIN_SIZE, config.MAX_SIZE);
      const color = Phaser.Utils.Array.GetRandom(colors);
      const lifetime = config.LIFETIME || 500;

      const particle = this.scene.add.circle(x, y, size, color, 1);
      particle.setDepth(60);

      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scale: 0.15,
        duration: lifetime + Phaser.Math.Between(0, 150),
        ease: 'Quad.easeOut',
        onComplete: () => particle.destroy(),
      });
    }
  }

  destroy() {
    eventBus.off(Events.SCREEN_SHAKE, this._onScreenShake);
    eventBus.off(Events.SCREEN_FLASH, this._onScreenFlash);
    eventBus.off(Events.FLOAT_TEXT, this._onFloatText);
    eventBus.off(Events.ENGINE_TRAIL, this._onEngineTrail);
    eventBus.off(Events.PARTICLES_EMIT, this._onParticlesEmit);
    eventBus.off(Events.SCORE_CHANGED, this._onScoreChanged);
    eventBus.off(Events.SHIP_HIT, this._onShipHit);
    eventBus.off(Events.ASTEROID_PASSED, this._onAsteroidPassed);
  }
}
