// explosion.js — explosion effect pixel art (8x8, 3 frames)
// Used for ship death / asteroid collision feedback
import { PALETTE } from './palette.js';

export const EXPLOSION_PALETTE = PALETTE.DARK;

// Frame 1: small burst
export const EXPLOSION_F1 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,7,0,0,0,0],
  [0,0,7,15,7,0,0,0],
  [0,7,15,15,15,7,0,0],
  [0,0,7,15,7,0,0,0],
  [0,0,0,7,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
];

// Frame 2: medium fireball
export const EXPLOSION_F2 = [
  [0,0,14,0,0,14,0,0],
  [0,14,7,14,14,7,14,0],
  [14,7,15,15,15,15,7,14],
  [0,14,15,15,15,15,14,0],
  [14,7,15,15,15,15,7,14],
  [0,14,7,14,14,7,14,0],
  [0,0,14,0,0,14,0,0],
  [0,0,0,0,0,0,0,0],
];

// Frame 3: fading smoke
export const EXPLOSION_F3 = [
  [0,0,0,13,0,0,0,0],
  [0,13,0,3,13,0,13,0],
  [0,0,3,14,3,13,0,0],
  [13,3,14,7,14,3,0,0],
  [0,0,3,14,3,0,13,0],
  [0,13,0,3,0,13,0,0],
  [0,0,13,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
];

export const EXPLOSION_FRAMES = [EXPLOSION_F1, EXPLOSION_F2, EXPLOSION_F3];
