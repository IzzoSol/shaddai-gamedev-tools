import Phaser from 'phaser';
import { SHIP, GAME, COLORS, EFFECTS } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { renderSpriteSheet } from '../core/PixelRenderer.js';
import { SHIP_FRAMES, SHIP_PALETTE } from '../sprites/ship.js';

export class Ship {
  constructor(scene) {
    this.scene = scene;

    // Determine pixel scale so the rendered sprite fills the SHIP dimensions.
    // The sprite grid is 16x16. We pick a scale that makes the rendered size
    // match the larger of SHIP.WIDTH or SHIP.HEIGHT, then let Phaser
    // setDisplaySize handle the final fit.
    const gridSize = 16;
    const desiredSize = Math.max(SHIP.WIDTH, SHIP.HEIGHT);
    const pixelScale = Math.max(2, Math.round(desiredSize / gridSize));

    // Render the spritesheet (engine flicker animation)
    renderSpriteSheet(scene, SHIP_FRAMES, SHIP_PALETTE, 'ship-sheet', pixelScale);

    // Create animation for engine flicker
    if (!scene.anims.exists('ship-engine')) {
      scene.anims.create({
        key: 'ship-engine',
        frames: scene.anims.generateFrameNumbers('ship-sheet', { start: 0, end: 1 }),
        frameRate: 8,
        repeat: -1,
      });
    }

    // Create sprite from spritesheet
    this.sprite = scene.physics.add.sprite(SHIP.START_X, SHIP.START_Y, 'ship-sheet', 0);
    this.sprite.setDisplaySize(SHIP.WIDTH, SHIP.HEIGHT);
    this.sprite.body.setCollideWorldBounds(true);
    // No gravity for the ship — it stays at the bottom
    this.sprite.body.setAllowGravity(false);
    // Shrink hitbox slightly for forgiving collision (70% of display size)
    const hitW = SHIP.WIDTH * 0.7;
    const hitH = SHIP.HEIGHT * 0.7;
    this.sprite.body.setSize(hitW, hitH);
    this.sprite.body.setOffset(
      (this.sprite.width - hitW) / 2,
      (this.sprite.height - hitH) / 2
    );

    // Play engine flicker animation
    this.sprite.play('ship-engine');
  }

  update(left, right, delta) {
    const body = this.sprite.body;
    const speed = SHIP.SPEED;
    const dt = delta / 1000;

    // Horizontal movement only
    if (left && !right) {
      body.setVelocityX(-speed);
    } else if (right && !left) {
      body.setVelocityX(speed);
    } else {
      body.setVelocityX(0);
    }

    // Clamp position within margins
    const minX = SHIP.MARGIN + SHIP.WIDTH / 2;
    const maxX = GAME.WIDTH - SHIP.MARGIN - SHIP.WIDTH / 2;
    if (this.sprite.x < minX) {
      this.sprite.x = minX;
      body.setVelocityX(0);
    } else if (this.sprite.x > maxX) {
      this.sprite.x = maxX;
      body.setVelocityX(0);
    }

    // No vertical velocity for ship
    body.setVelocityY(0);

    // --- Ship tilt toward movement direction ---
    const tiltCfg = EFFECTS.SHIP_TILT;
    let targetAngle = 0;
    if (body.velocity.x < 0) {
      targetAngle = -tiltCfg.MAX_ANGLE;
    } else if (body.velocity.x > 0) {
      targetAngle = tiltCfg.MAX_ANGLE;
    }
    // Smooth interpolation toward target angle
    const lerpFactor = 1 - Math.exp(-tiltCfg.LERP_SPEED * dt);
    this.sprite.rotation = this.sprite.rotation + (targetAngle - this.sprite.rotation) * lerpFactor;

    // --- Engine trail particles ---
    // Emit trail from bottom-center of ship
    eventBus.emit(Events.ENGINE_TRAIL, {
      x: this.sprite.x,
      y: this.sprite.y + SHIP.HEIGHT * 0.45,
    });
  }

  getPosition() {
    return { x: Math.round(this.sprite.x), y: Math.round(this.sprite.y) };
  }

  reset() {
    this.sprite.setPosition(SHIP.START_X, SHIP.START_Y);
    this.sprite.body.setVelocity(0, 0);
    this.sprite.setActive(true);
    this.sprite.setVisible(true);
    this.sprite.play('ship-engine');
  }

  destroy() {
    this.sprite.destroy();
  }
}
