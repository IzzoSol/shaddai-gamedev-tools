import { eventBus, Events } from '../core/EventBus.js';
import { gameState } from '../core/GameState.js';
import { SCORING } from '../core/Constants.js';

export class ScoreSystem {
  constructor() {
    this.onAsteroidPassed = this.onAsteroidPassed.bind(this);
    eventBus.on(Events.ASTEROID_PASSED, this.onAsteroidPassed);
  }

  onAsteroidPassed(data) {
    gameState.addScore(SCORING.POINTS_PER_DODGE);
    eventBus.emit(Events.SCORE_CHANGED, {
      score: gameState.score,
      x: data?.x,
      y: data?.y,
    });
  }

  destroy() {
    eventBus.off(Events.ASTEROID_PASSED, this.onAsteroidPassed);
  }
}
