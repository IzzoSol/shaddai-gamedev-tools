import Phaser from 'phaser';
import { GAME, SHIP, ASTEROID, STARS, COLORS, SAFE_ZONE, PX, TRANSITION, EFFECTS } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { renderPixelArt, renderSpriteSheet } from '../core/PixelRenderer.js';
import { Ship } from '../entities/Ship.js';
import { Asteroid, createAsteroidTextures } from '../entities/Asteroid.js';
import { ScoreSystem } from '../systems/ScoreSystem.js';
import { VisualEffects } from '../systems/VisualEffects.js';
import { EXPLOSION_FRAMES, EXPLOSION_PALETTE } from '../sprites/explosion.js';
import { STAR_TILES, NEBULA_VARIANTS, TILE_PALETTE } from '../sprites/tiles.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    gameState.reset();

    // --- Background: space gradient ---
    this.drawSpaceBackground();

    // --- Pixel art star tiles scattered over the gradient ---
    this.createPixelStarfield();

    // --- Nebula decorations ---
    this.createNebulaDecorations();

    // --- Scrolling parallax stars (small circle dots for motion effect) ---
    this.stars = [];
    this.createScrollingStars();

    // --- Generate pixel art asteroid textures ---
    this.asteroidTextureKeys = createAsteroidTextures(this);

    // --- Generate explosion spritesheet ---
    const explosionGridSize = 8;
    const explosionScale = Math.max(2, Math.round((ASTEROID.MAX_RADIUS * 2) / explosionGridSize));
    renderSpriteSheet(this, EXPLOSION_FRAMES, EXPLOSION_PALETTE, 'explosion-sheet', explosionScale);

    if (!this.anims.exists('explosion-anim')) {
      this.anims.create({
        key: 'explosion-anim',
        frames: this.anims.generateFrameNumbers('explosion-sheet', { start: 0, end: 2 }),
        frameRate: 10,
        repeat: 0,
      });
    }

    // --- Ship (player) ---
    this.ship = new Ship(this);

    // --- Asteroid pool ---
    this.asteroids = this.physics.add.group({
      classType: Asteroid,
      maxSize: ASTEROID.POOL_SIZE,
      runChildUpdate: true,
    });

    // Pre-populate pool
    for (let i = 0; i < ASTEROID.POOL_SIZE; i++) {
      const key = Phaser.Utils.Array.GetRandom(this.asteroidTextureKeys);
      const a = new Asteroid(this, 0, 0, key);
      this.asteroids.add(a, true);
    }

    // --- Collision: ship vs asteroids ---
    this.physics.add.overlap(
      this.ship.sprite,
      this.asteroids,
      this.onShipHit,
      // Only collide with active asteroids
      (ship, asteroid) => asteroid.active,
      this
    );

    // --- Score system ---
    this.scoreSystem = new ScoreSystem();

    // --- Visual effects system (particles, shake, flash, floating text) ---
    this.visualEffects = new VisualEffects(this);

    // --- Spawn timer ---
    this.spawnTimer = 0;
    this.currentSpawnInterval = ASTEROID.BASE_SPAWN_INTERVAL;

    // --- Input: keyboard ---
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // --- Input: touch (tap zones — works on ALL devices, not just mobile) ---
    // Left half of screen = move left, right half = move right
    this.touchLeft = false;
    this.touchRight = false;

    this._onPointerDown = (pointer) => {
      if (pointer.x < GAME.WIDTH / 2) {
        this.touchLeft = true;
      } else {
        this.touchRight = true;
      }
    };
    this._onPointerUp = () => {
      this.touchLeft = false;
      this.touchRight = false;
    };

    this.input.on('pointerdown', this._onPointerDown);
    this.input.on('pointerup', this._onPointerUp);
    this.input.on('pointerout', this._onPointerUp);

    // --- Start gameplay immediately ---
    gameState.started = true;
    eventBus.emit(Events.GAME_START);

    // --- EventBus listeners ---
    this._onGameRestart = () => {};
    eventBus.on(Events.GAME_RESTART, this._onGameRestart);

    // --- Scene cleanup ---
    this.events.on('shutdown', this.cleanup, this);

    // --- Fade in ---
    this.cameras.main.fadeIn(TRANSITION.FADE_DURATION, 0, 0, 0);
  }

  update(time, delta) {
    if (gameState.gameOver) return;

    // --- Scroll parallax stars ---
    this.updateScrollingStars(delta);

    // --- Merge keyboard + touch input ---
    const left = this.cursors.left.isDown || this.wasd.left.isDown || this.touchLeft;
    const right = this.cursors.right.isDown || this.wasd.right.isDown || this.touchRight;

    this.ship.update(left, right, delta);

    // --- Spawn asteroids on interval ---
    this.spawnTimer += delta;
    this.currentSpawnInterval = Math.max(
      ASTEROID.MIN_SPAWN_INTERVAL,
      ASTEROID.BASE_SPAWN_INTERVAL - gameState.score * ASTEROID.SPAWN_INTERVAL_PER_SCORE
    );

    if (this.spawnTimer >= this.currentSpawnInterval) {
      this.spawnTimer = 0;
      this.spawnAsteroid();
    }

    // --- Check for asteroids that passed the bottom (scoring) ---
    this.checkAsteroidsPassed();
  }

  spawnAsteroid() {
    // Pick a random texture variant
    const key = Phaser.Utils.Array.GetRandom(this.asteroidTextureKeys);

    // Find an inactive asteroid in the pool
    let asteroid = this.asteroids.getChildren().find(a => !a.active);

    if (!asteroid) {
      // Pool exhausted — skip this spawn
      return;
    }

    // Re-assign texture for visual variety
    asteroid.setTexture(key);

    const radius = Phaser.Math.Between(
      Math.round(ASTEROID.MIN_RADIUS),
      Math.round(ASTEROID.MAX_RADIUS)
    );

    const x = Phaser.Math.Between(
      Math.round(ASTEROID.SPAWN_PADDING + radius),
      Math.round(GAME.WIDTH - ASTEROID.SPAWN_PADDING - radius)
    );

    const speed = Math.min(
      ASTEROID.MAX_SPEED,
      ASTEROID.BASE_SPEED + gameState.score * ASTEROID.SPEED_PER_SCORE
    );

    asteroid.launch(x, speed, radius);
    eventBus.emit(Events.ASTEROID_SPAWN, { x, speed, radius });
  }

  checkAsteroidsPassed() {
    const children = this.asteroids.getChildren();
    for (let i = 0; i < children.length; i++) {
      const a = children[i];
      if (a.active && !a.scored && a.y > GAME.HEIGHT + a.asteroidRadius) {
        a.scored = true;
        eventBus.emit(Events.ASTEROID_PASSED, { x: a.x, y: GAME.HEIGHT });
      }
    }
  }

  onShipHit(shipSprite, asteroid) {
    if (gameState.gameOver) return;
    if (!asteroid.active) return;

    gameState.gameOver = true;
    asteroid.deactivate();

    // Play explosion animation at collision point
    this.spawnExplosion(shipSprite.x, shipSprite.y);

    // Emit events — VisualEffects system handles particles, shake, and flash
    eventBus.emit(Events.SHIP_HIT, {
      x: shipSprite.x,
      y: shipSprite.y,
    });
    eventBus.emit(Events.GAME_OVER, { score: gameState.score });

    // --- Slow-mo death sequence ---
    this.time.timeScale = EFFECTS.SLOWMO_SCALE;

    // Restore time scale after slow-mo period
    this.time.delayedCall(EFFECTS.SLOWMO_DURATION * EFFECTS.SLOWMO_SCALE, () => {
      this.time.timeScale = 1;
    });

    // Fade out then transition to game over scene
    this.time.delayedCall(EFFECTS.DEATH_DELAY, () => {
      this.cameras.main.fadeOut(TRANSITION.FADE_DURATION, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('GameOverScene');
      });
    });
  }

  spawnExplosion(x, y) {
    const boom = this.add.sprite(x, y, 'explosion-sheet', 0);
    const size = ASTEROID.MAX_RADIUS * 3;
    boom.setDisplaySize(size, size);
    boom.setDepth(50);
    boom.play('explosion-anim');
    boom.once('animationcomplete', () => {
      boom.destroy();
    });
  }

  // --- Background helpers ---

  drawSpaceBackground() {
    const bg = this.add.graphics();
    const top = Phaser.Display.Color.IntegerToColor(COLORS.BG_SPACE_TOP);
    const bot = Phaser.Display.Color.IntegerToColor(COLORS.BG_SPACE_BOTTOM);
    const steps = 64;
    const bandH = Math.ceil(GAME.HEIGHT / steps);

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(top.red + (bot.red - top.red) * t);
      const g = Math.round(top.green + (bot.green - top.green) * t);
      const b = Math.round(top.blue + (bot.blue - top.blue) * t);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      bg.fillRect(0, i * bandH, GAME.WIDTH, bandH + 1);
    }
    bg.setDepth(-100);
  }

  createPixelStarfield() {
    // Render star tile textures
    const tileGridSize = 16;
    const tileScale = Math.max(2, Math.round((GAME.WIDTH * 0.04) / tileGridSize));
    const tileSize = tileGridSize * tileScale;

    for (let i = 0; i < STAR_TILES.length; i++) {
      renderPixelArt(this, STAR_TILES[i], TILE_PALETTE, `star-tile-${i}`, tileScale);
    }

    // Scatter star cluster tiles across the background
    // Use a grid with random placement — not every cell gets a tile
    for (let y = 0; y < GAME.HEIGHT; y += tileSize * 2) {
      for (let x = 0; x < GAME.WIDTH; x += tileSize * 2) {
        // 40% chance of placing a star tile in each cell
        if (Math.random() < 0.4) {
          const variant = Math.floor(Math.random() * STAR_TILES.length);
          const offsetX = Math.random() * tileSize;
          const offsetY = Math.random() * tileSize;
          const tile = this.add.image(x + offsetX, y + offsetY, `star-tile-${variant}`);
          tile.setDepth(-95);
          tile.setAlpha(0.4 + Math.random() * 0.4);
        }
      }
    }
  }

  createNebulaDecorations() {
    const nebulaGridSize = 8;
    const nebulaScale = Math.max(2, Math.round((GAME.WIDTH * 0.03) / nebulaGridSize));

    for (let i = 0; i < NEBULA_VARIANTS.length; i++) {
      renderPixelArt(this, NEBULA_VARIANTS[i], TILE_PALETTE, `nebula-${i}`, nebulaScale);
    }

    // Scatter 15-25 nebula wisps across the screen
    const count = 15 + Math.floor(Math.random() * 11);
    for (let i = 0; i < count; i++) {
      const nx = Phaser.Math.Between(0, GAME.WIDTH);
      const ny = Phaser.Math.Between(0, GAME.HEIGHT);
      const variant = Math.floor(Math.random() * NEBULA_VARIANTS.length);
      const neb = this.add.image(nx, ny, `nebula-${variant}`);
      neb.setDepth(-92);
      neb.setAlpha(0.15 + Math.random() * 0.2);
      // Slight random scale variation for organic feel
      const s = 0.7 + Math.random() * 0.8;
      neb.setScale(s);
    }
  }

  createScrollingStars() {
    // Small moving dots for parallax motion feel (on top of static pixel tiles)
    for (let i = 0; i < STARS.COUNT; i++) {
      const x = Phaser.Math.Between(0, GAME.WIDTH);
      const y = Phaser.Math.Between(0, GAME.HEIGHT);
      const size = Phaser.Math.FloatBetween(STARS.MIN_SIZE, STARS.MAX_SIZE);
      const speed = Phaser.Math.FloatBetween(STARS.MIN_SPEED, STARS.MAX_SPEED);
      const alpha = Phaser.Math.FloatBetween(0.3, 1.0);

      const star = this.add.circle(x, y, size, STARS.COLOR, alpha);
      star.setDepth(-90);
      this.stars.push({ obj: star, speed });
    }
  }

  updateScrollingStars(delta) {
    const dt = delta / 1000;
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      s.obj.y += s.speed * dt;
      if (s.obj.y > GAME.HEIGHT + 5) {
        s.obj.y = -5;
        s.obj.x = Phaser.Math.Between(0, GAME.WIDTH);
      }
    }
  }

  // --- Cleanup ---

  cleanup() {
    if (this.scoreSystem) {
      this.scoreSystem.destroy();
      this.scoreSystem = null;
    }
    if (this.visualEffects) {
      this.visualEffects.destroy();
      this.visualEffects = null;
    }
    // Ensure time scale is restored on scene exit
    this.time.timeScale = 1;
    eventBus.off(Events.GAME_RESTART, this._onGameRestart);
    this.input.off('pointerdown', this._onPointerDown);
    this.input.off('pointerup', this._onPointerUp);
    this.input.off('pointerout', this._onPointerUp);
  }
}
