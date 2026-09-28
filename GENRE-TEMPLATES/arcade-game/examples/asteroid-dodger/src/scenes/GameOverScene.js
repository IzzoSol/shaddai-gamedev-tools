import Phaser from 'phaser';
import { GAME, COLORS, UI, TRANSITION, SAFE_ZONE, GAMEOVER_UI, PX } from '../core/Constants.js';
import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    const w = GAME.WIDTH;
    const h = GAME.HEIGHT;
    const cx = w / 2;

    this._transitioning = false;

    // Usable area below Play.fun widget bar
    const safeTop = SAFE_ZONE.TOP;
    const usableH = h - safeTop;

    // --- Gradient background ---
    this.drawGradient(w, h, COLORS.BG_TOP, COLORS.BG_BOTTOM);

    // --- Floating ambient particles in background ---
    this.createAmbientParticles(w, h);

    // --- "GAME OVER" title with drop-in entrance ---
    const titleSize = Math.round(h * UI.TITLE_RATIO);
    const titleY = safeTop + usableH * 0.15;
    const title = this.add.text(cx, titleY - 80 * PX, 'GAME OVER', {
      fontSize: titleSize + 'px',
      fontFamily: UI.FONT,
      color: COLORS.UI_TEXT,
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 3, color: 'rgba(0,0,0,0.5)', blur: 8, fill: true },
    }).setOrigin(0.5).setAlpha(0);

    // Title entrance: drop down + fade in with bounce
    this.tweens.add({
      targets: title,
      y: titleY,
      alpha: 1,
      duration: GAMEOVER_UI.TITLE_DROP_DURATION,
      ease: GAMEOVER_UI.TITLE_DROP_EASE,
    });

    // --- Score panel ---
    const panelW = w * 0.6;
    const panelH = h * 0.2;
    const panelY = safeTop + usableH * 0.35;

    const panel = this.add.graphics();
    panel.setAlpha(0);
    panel.fillStyle(0x000000, 0.35);
    panel.fillRoundedRect(cx - panelW / 2, panelY - panelH / 2, panelW, panelH, 16);
    panel.lineStyle(2, 0x6c63ff, 0.6);
    panel.strokeRoundedRect(cx - panelW / 2, panelY - panelH / 2, panelW, panelH, 16);

    // Panel fade in
    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 300,
      delay: 200,
    });

    // Score label
    const labelSize = Math.round(h * UI.SMALL_RATIO);
    const scoreLabel = this.add.text(cx, panelY - panelH * 0.22, 'SCORE', {
      fontSize: labelSize + 'px',
      fontFamily: UI.FONT,
      color: COLORS.MUTED_TEXT,
      letterSpacing: 4,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: scoreLabel,
      alpha: 1,
      duration: 300,
      delay: 250,
    });

    // Score value with count-up animation
    const scoreSize = Math.round(h * UI.HEADING_RATIO * 1.2);
    const scoreText = this.add.text(cx, panelY + panelH * 0.05, '0', {
      fontSize: scoreSize + 'px',
      fontFamily: UI.FONT,
      color: COLORS.SCORE_GOLD,
      fontStyle: 'bold',
    }).setOrigin(0.5).setScale(0);

    // Scale-in then count-up
    this.tweens.add({
      targets: scoreText,
      scaleX: 1,
      scaleY: 1,
      duration: 400,
      delay: GAMEOVER_UI.SCORE_COUNTUP_DELAY,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Count-up effect
        const finalScore = gameState.score;
        if (finalScore === 0) {
          scoreText.setText('0');
          return;
        }
        const counter = { val: 0 };
        this.tweens.add({
          targets: counter,
          val: finalScore,
          duration: GAMEOVER_UI.SCORE_COUNTUP_DURATION,
          ease: 'Quad.easeOut',
          onUpdate: () => {
            scoreText.setText(Math.round(counter.val).toString());
          },
          onComplete: () => {
            scoreText.setText(finalScore.toString());
            // Pulse effect when count-up finishes
            this.tweens.add({
              targets: scoreText,
              scaleX: 1.15,
              scaleY: 1.15,
              duration: 100,
              yoyo: true,
              ease: 'Quad.easeOut',
            });
          },
        });
      },
    });

    // Best score (appears after score count-up)
    const bestSize = Math.round(h * UI.SMALL_RATIO);
    const bestText = this.add.text(cx, panelY + panelH * 0.35, `Best: ${gameState.bestScore}`, {
      fontSize: bestSize + 'px',
      fontFamily: UI.FONT,
      color: COLORS.MUTED_TEXT,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: bestText,
      alpha: 1,
      duration: 300,
      delay: GAMEOVER_UI.SCORE_COUNTUP_DELAY + GAMEOVER_UI.SCORE_COUNTUP_DURATION * 0.5,
    });

    // --- New best score indicator ---
    if (gameState.score === gameState.bestScore && gameState.score > 0) {
      const newBestLabel = this.add.text(cx, panelY - panelH * 0.45, 'NEW BEST!', {
        fontSize: Math.round(h * UI.SMALL_RATIO * 0.9) + 'px',
        fontFamily: UI.FONT,
        color: '#ffd700',
        fontStyle: 'bold',
      }).setOrigin(0.5).setAlpha(0);

      this.tweens.add({
        targets: newBestLabel,
        alpha: 1,
        duration: 300,
        delay: GAMEOVER_UI.SCORE_COUNTUP_DELAY + GAMEOVER_UI.SCORE_COUNTUP_DURATION,
      });

      // Gentle pulsing on "NEW BEST!"
      this.tweens.add({
        targets: newBestLabel,
        scaleX: 1.08,
        scaleY: 1.08,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: GAMEOVER_UI.SCORE_COUNTUP_DELAY + GAMEOVER_UI.SCORE_COUNTUP_DURATION + 300,
      });
    }

    // --- Play Again button with entrance animation ---
    const btnY = safeTop + usableH * 0.6;
    const btnContainer = this.createButton(cx, btnY, 'PLAY AGAIN', () => this.restartGame());

    // Button entrance: slide up from below + fade in
    btnContainer.setAlpha(0);
    btnContainer.y = btnY + 40 * PX;
    this.tweens.add({
      targets: btnContainer,
      y: btnY,
      alpha: 1,
      duration: GAMEOVER_UI.BTN_ENTRANCE_DURATION,
      delay: GAMEOVER_UI.BTN_ENTRANCE_DELAY,
      ease: 'Back.easeOut',
    });

    // --- Hint text ---
    const hintSize = Math.round(h * UI.SMALL_RATIO * 0.8);
    const hint = this.add.text(cx, safeTop + usableH * 0.72, 'or press SPACE', {
      fontSize: hintSize + 'px',
      fontFamily: UI.FONT,
      color: COLORS.MUTED_TEXT,
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: hint,
      alpha: 0.6,
      duration: 400,
      delay: GAMEOVER_UI.BTN_ENTRANCE_DELAY + 200,
    });

    // --- Keyboard shortcut ---
    this.input.keyboard.once('keydown-SPACE', () => this.restartGame());

    // --- Fade in ---
    this.cameras.main.fadeIn(TRANSITION.FADE_DURATION, 0, 0, 0);
  }

  restartGame() {
    if (this._transitioning) return;
    this._transitioning = true;

    eventBus.emit(Events.GAME_RESTART);
    this.cameras.main.fadeOut(TRANSITION.FADE_DURATION, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('GameScene');
    });
  }

  // --- Floating ambient particles ---

  createAmbientParticles(w, h) {
    const count = GAMEOVER_UI.BG_PARTICLE_COUNT;
    const colors = GAMEOVER_UI.BG_PARTICLE_COLORS;
    this.ambientParticles = [];

    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(0, w);
      const y = Phaser.Math.Between(0, h);
      const size = Phaser.Math.FloatBetween(1 * PX, 3 * PX);
      const color = Phaser.Utils.Array.GetRandom(colors);
      const alpha = Phaser.Math.FloatBetween(0.15, 0.4);
      const speedY = Phaser.Math.FloatBetween(
        -GAMEOVER_UI.BG_PARTICLE_SPEED,
        -GAMEOVER_UI.BG_PARTICLE_SPEED * 0.3
      );
      const speedX = Phaser.Math.FloatBetween(
        -GAMEOVER_UI.BG_PARTICLE_SPEED * 0.3,
        GAMEOVER_UI.BG_PARTICLE_SPEED * 0.3
      );

      const p = this.add.circle(x, y, size, color, alpha);
      p.setDepth(-1);
      this.ambientParticles.push({ obj: p, vx: speedX, vy: speedY });
    }
  }

  update(time, delta) {
    // Animate ambient floating particles
    if (!this.ambientParticles) return;
    const dt = delta / 1000;
    for (const p of this.ambientParticles) {
      p.obj.x += p.vx * dt;
      p.obj.y += p.vy * dt;
      // Wrap around screen
      if (p.obj.y < -10) p.obj.y = GAME.HEIGHT + 10;
      if (p.obj.x < -10) p.obj.x = GAME.WIDTH + 10;
      if (p.obj.x > GAME.WIDTH + 10) p.obj.x = -10;
    }
  }

  // --- Helpers ---

  drawGradient(w, h, topColor, bottomColor) {
    const bg = this.add.graphics();
    const top = Phaser.Display.Color.IntegerToColor(topColor);
    const bot = Phaser.Display.Color.IntegerToColor(bottomColor);
    const steps = 64;
    const bandH = Math.ceil(h / steps);

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const r = Math.round(top.red + (bot.red - top.red) * t);
      const g = Math.round(top.green + (bot.green - top.green) * t);
      const b = Math.round(top.blue + (bot.blue - top.blue) * t);
      bg.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
      bg.fillRect(0, i * bandH, w, bandH + 1);
    }
  }

  createButton(x, y, label, callback) {
    const btnW = Math.max(GAME.WIDTH * UI.BTN_W_RATIO, 160);
    const btnH = Math.max(GAME.HEIGHT * UI.BTN_H_RATIO, UI.MIN_TOUCH);
    const radius = UI.BTN_RADIUS;

    const container = this.add.container(x, y);

    // 1. Glow effect behind button (for hover)
    const glow = this.add.graphics();
    glow.setAlpha(0);
    container.add(glow);

    // 2. Graphics background
    const bg = this.add.graphics();
    this.fillBtn(bg, btnW, btnH, radius, COLORS.BTN_PRIMARY);
    container.add(bg);

    // 3. Text label
    const fontSize = Math.round(GAME.HEIGHT * UI.BODY_RATIO);
    const text = this.add.text(0, 0, label, {
      fontSize: fontSize + 'px',
      fontFamily: UI.FONT,
      color: COLORS.BTN_TEXT,
      fontStyle: 'bold',
    }).setOrigin(0.5);
    container.add(text);

    // 4. Make the CONTAINER interactive
    container.setSize(btnW, btnH);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      this.fillBtn(bg, btnW, btnH, radius, COLORS.BTN_PRIMARY_HOVER);
      // Draw glow
      glow.clear();
      glow.fillStyle(GAMEOVER_UI.BTN_GLOW_COLOR, GAMEOVER_UI.BTN_GLOW_ALPHA);
      const glowPad = GAMEOVER_UI.BTN_GLOW_RADIUS;
      glow.fillRoundedRect(
        -btnW / 2 - glowPad,
        -btnH / 2 - glowPad,
        btnW + glowPad * 2,
        btnH + glowPad * 2,
        radius + glowPad * 0.5
      );
      this.tweens.add({ targets: glow, alpha: 1, duration: 120 });
      this.tweens.add({ targets: container, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });

    container.on('pointerout', () => {
      this.fillBtn(bg, btnW, btnH, radius, COLORS.BTN_PRIMARY);
      this.tweens.add({ targets: glow, alpha: 0, duration: 120 });
      this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 100 });
    });

    container.on('pointerdown', () => {
      this.fillBtn(bg, btnW, btnH, radius, COLORS.BTN_PRIMARY_PRESS);
      this.tweens.add({ targets: container, scaleX: 0.95, scaleY: 0.95, duration: 50 });
    });

    container.on('pointerup', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 50,
        onComplete: () => callback(),
      });
    });

    return container;
  }

  fillBtn(gfx, w, h, radius, color) {
    gfx.clear();
    gfx.fillStyle(color, 1);
    gfx.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
  }
}
