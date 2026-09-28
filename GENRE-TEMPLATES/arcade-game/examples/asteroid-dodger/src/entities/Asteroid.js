import Phaser from 'phaser';
import { ASTEROID, GAME } from '../core/Constants.js';
import { renderPixelArt } from '../core/PixelRenderer.js';
import { ASTEROID_VARIANTS, ASTEROID_PALETTE } from '../sprites/asteroids.js';

/**
 * Number of pixel art asteroid texture variants available.
 */
export const ASTEROID_VARIANT_COUNT = ASTEROID_VARIANTS.length;

/**
 * Generate all pixel art asteroid textures at the appropriate scale.
 * Call once during scene create. Safe to call multiple times (textures
 * are only created if they don't already exist).
 *
 * @param {Phaser.Scene} scene
 * @returns {string[]} Array of texture keys created
 */
export function createAsteroidTextures(scene) {
  const gridSize = 16;
  const desiredSize = Math.ceil(ASTEROID.MAX_RADIUS * 2);
  const pixelScale = Math.max(2, Math.round(desiredSize / gridSize));

  const keys = [];
  for (let i = 0; i < ASTEROID_VARIANTS.length; i++) {
    const key = `asteroid_${i}`;
    renderPixelArt(scene, ASTEROID_VARIANTS[i], ASTEROID_PALETTE, key, pixelScale);
    keys.push(key);
  }
  return keys;
}

/**
 * Individual asteroid object managed by the AsteroidPool.
 * Each asteroid is a physics sprite using a pixel art texture.
 */
export class Asteroid extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey) {
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.setActive(false);
    this.setVisible(false);

    // Track radius for collision sizing
    this.asteroidRadius = 0;
    // Track whether this asteroid has been scored (passed the bottom)
    this.scored = false;
  }

  launch(x, speed, radius) {
    this.asteroidRadius = radius;
    this.scored = false;

    this.setPosition(x, ASTEROID.SPAWN_Y);
    this.setActive(true);
    this.setVisible(true);

    // Scale the sprite to match the desired radius
    this.setDisplaySize(radius * 2, radius * 2);

    // Set circular physics body centered on the sprite
    // Use 70% of radius for slightly forgiving collisions
    const bodyRadius = radius * 0.7;
    this.body.setCircle(
      bodyRadius / this.scaleX,
      (this.width - (bodyRadius * 2) / this.scaleX) / 2,
      (this.height - (bodyRadius * 2) / this.scaleY) / 2
    );

    // Set downward velocity
    this.body.setVelocityY(speed);

    // Random slow rotation for visual variety
    this.rotationSpeed = Phaser.Math.FloatBetween(-0.02, 0.02);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.active) return;

    // Rotate
    this.rotation += this.rotationSpeed * delta;

    // Check if asteroid has gone below the screen
    if (this.y > GAME.HEIGHT + this.asteroidRadius * 2) {
      this.deactivate();
    }
  }

  deactivate() {
    this.setActive(false);
    this.setVisible(false);
    this.body.setVelocity(0, 0);
  }
}
