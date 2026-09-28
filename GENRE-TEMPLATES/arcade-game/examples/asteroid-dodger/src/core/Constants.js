// --- Display ---

// Device pixel ratio (capped at 2 for mobile GPU performance)
export const DPR = Math.min(window.devicePixelRatio || 1, 2);

// Orientation: landscape on desktop, portrait on mobile
const _isPortrait = window.innerHeight > window.innerWidth;

// Design dimensions (logical game units at 1x scale)
const _designW = _isPortrait ? 540 : 960;
const _designH = _isPortrait ? 960 : 540;
const _designAspect = _designW / _designH;

// Canvas dimensions = device pixel area, maintaining design aspect ratio.
// This ensures the canvas has enough resolution for the user's actual display
// so FIT mode never CSS-upscales (which causes blurriness on retina).
const _deviceW = window.innerWidth * DPR;
const _deviceH = window.innerHeight * DPR;

let _canvasW, _canvasH;
if (_deviceW / _deviceH > _designAspect) {
  _canvasW = _deviceW;
  _canvasH = Math.round(_deviceW / _designAspect);
} else {
  _canvasW = Math.round(_deviceH * _designAspect);
  _canvasH = _deviceH;
}

// PX = canvas pixels per design pixel. Scales all absolute values (sizes, speeds, etc.)
// from design space to canvas space. Gameplay proportions stay identical across all displays.
export const PX = _canvasW / _designW;

export const GAME = {
  WIDTH: _canvasW,
  HEIGHT: _canvasH,
  IS_PORTRAIT: _isPortrait,
};

// --- Safe Zone (Play.fun widget overlay) ---
// The Play.fun SDK widget renders a 75px fixed bar at top:0, z-index:9999.
// All UI text, buttons, and interactive elements must be positioned below SAFE_ZONE.TOP.
export const SAFE_ZONE = {
  TOP: GAME.HEIGHT * 0.08,
  BOTTOM: 0,
  LEFT: 0,
  RIGHT: 0,
};

// --- Ship (player spaceship) ---

export const SHIP = {
  WIDTH: GAME.WIDTH * 0.07,
  HEIGHT: GAME.HEIGHT * 0.08,
  // Ship sits near the bottom of the screen
  START_X: GAME.WIDTH * 0.5,
  START_Y: GAME.HEIGHT * 0.88,
  SPEED: 450 * PX,
  COLOR: 0x44aaff,
  COCKPIT_COLOR: 0x88ddff,
  ENGINE_COLOR: 0xff6622,
  // Horizontal margin — ship cannot go beyond this from screen edges
  MARGIN: GAME.WIDTH * 0.03,
};

// --- Asteroids ---

export const ASTEROID = {
  MIN_RADIUS: GAME.WIDTH * 0.02,
  MAX_RADIUS: GAME.WIDTH * 0.045,
  // Initial falling speed (pixels per second)
  BASE_SPEED: 180 * PX,
  // Speed increase per point scored
  SPEED_PER_SCORE: 2.5 * PX,
  // Maximum falling speed cap
  MAX_SPEED: 500 * PX,
  // Initial spawn interval in ms
  BASE_SPAWN_INTERVAL: 1200,
  // Minimum spawn interval cap (ms)
  MIN_SPAWN_INTERVAL: 350,
  // Spawn interval decrease per point scored (ms)
  SPAWN_INTERVAL_PER_SCORE: 18,
  // Object pool max size
  POOL_SIZE: 30,
  // Color palette for asteroids (procedural variety)
  COLORS: [0x8b7355, 0x9e8c6c, 0x6b5b3e, 0xa0937a, 0x7a6b50],
  // Spawn y offset above top of screen
  SPAWN_Y: -GAME.HEIGHT * 0.05,
  // Horizontal spawn padding from edges
  SPAWN_PADDING: GAME.WIDTH * 0.05,
};

// --- Scoring ---

export const SCORING = {
  // Points earned when an asteroid passes the bottom without hitting the ship
  POINTS_PER_DODGE: 1,
};

// --- Stars background ---

export const STARS = {
  COUNT: 80,
  MIN_SIZE: 1 * PX,
  MAX_SIZE: 3 * PX,
  MIN_SPEED: 20 * PX,
  MAX_SPEED: 60 * PX,
  COLOR: 0xffffff,
};

// --- Colors ---

export const COLORS = {
  // Gameplay background (deep space)
  BG_SPACE_TOP: 0x0a0a1a,
  BG_SPACE_BOTTOM: 0x141432,

  // Ship
  SHIP: 0x44aaff,
  SHIP_COCKPIT: 0x88ddff,
  SHIP_ENGINE: 0xff6622,

  // UI text
  UI_TEXT: '#ffffff',
  UI_SHADOW: '#000000',
  MUTED_TEXT: '#8888aa',
  SCORE_GOLD: '#ffd700',

  // GameOver gradient backgrounds
  BG_TOP: 0x0f0c29,
  BG_BOTTOM: 0x302b63,

  // Buttons
  BTN_PRIMARY: 0x6c63ff,
  BTN_PRIMARY_HOVER: 0x857dff,
  BTN_PRIMARY_PRESS: 0x5a52d5,
  BTN_TEXT: '#ffffff',
};

// --- UI sizing (proportional to game dimensions) ---

export const UI = {
  FONT: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  TITLE_RATIO: 0.08,          // title font size as % of GAME.HEIGHT
  HEADING_RATIO: 0.05,        // heading font size
  BODY_RATIO: 0.035,          // body/button font size
  SMALL_RATIO: 0.025,         // hint/caption font size
  BTN_W_RATIO: 0.45,          // button width as % of GAME.WIDTH
  BTN_H_RATIO: 0.075,         // button height as % of GAME.HEIGHT
  BTN_RADIUS: 12 * PX,        // button corner radius
  MIN_TOUCH: 44 * PX,         // minimum touch target
  // Score HUD omitted — Play.fun widget displays score in SAFE_ZONE.TOP area
};

// --- Transitions ---

export const TRANSITION = {
  FADE_DURATION: 350,
};

// --- Particles ---

export const PARTICLES = {
  // Engine trail (behind ship)
  ENGINE_TRAIL: {
    COUNT: 3,                    // particles per frame
    MIN_SIZE: 2 * PX,
    MAX_SIZE: 4 * PX,
    SPEED: 80 * PX,             // downward drift speed
    SPREAD: SHIP.WIDTH * 0.2,   // horizontal spread from center
    LIFETIME: 400,              // ms before particle fades
    COLORS: [0xff6622, 0xffcc00, 0xff8844, 0xf5d742],
  },
  // Asteroid debris (on passing bottom or destruction)
  DEBRIS: {
    COUNT: 6,
    MIN_SIZE: 2 * PX,
    MAX_SIZE: 5 * PX,
    SPEED: 100 * PX,
    LIFETIME: 500,
    COLORS: [0x8b7355, 0x6b5b3e, 0xa0937a, 0x4a4a6a],
  },
  // Death explosion burst
  DEATH_BURST: {
    COUNT: 16,
    MIN_SIZE: 3 * PX,
    MAX_SIZE: 7 * PX,
    SPEED: 150 * PX,
    LIFETIME: 600,
    COLORS: [0xff6622, 0xffcc00, 0xff8844, 0xe94560, 0xffffff],
  },
  // Score popup sparkle
  SCORE_SPARKLE: {
    COUNT: 5,
    MIN_SIZE: 1 * PX,
    MAX_SIZE: 3 * PX,
    SPEED: 40 * PX,
    LIFETIME: 400,
    COLORS: [0xffd700, 0xffcc00, 0xf5d742],
  },
};

// --- Visual Effects ---

export const EFFECTS = {
  // Camera shake on collision
  SHAKE_INTENSITY: 0.02,
  SHAKE_DURATION: 300,
  // Screen flash on death (white)
  FLASH_DURATION: 250,
  FLASH_COLOR: { r: 255, g: 255, b: 255 },
  // Slow-mo death sequence
  SLOWMO_SCALE: 0.3,           // time scale during slow-mo
  SLOWMO_DURATION: 500,        // how long slow-mo lasts (ms real time)
  DEATH_DELAY: 800,            // total delay before scene transition (ms)
  // Floating score text
  FLOAT_TEXT: {
    OFFSET_Y: -20 * PX,
    RISE: 50 * PX,
    DURATION: 700,
    FONT_SIZE_RATIO: 0.04,     // relative to GAME.HEIGHT
    COLOR: '#ffd700',
    STROKE: '#000000',
    STROKE_THICKNESS: 3,
  },
  // Ship tilt
  SHIP_TILT: {
    MAX_ANGLE: 0.2,            // max rotation in radians (~11 degrees)
    LERP_SPEED: 8,             // interpolation speed (higher = snappier)
  },
};

// --- Game Over UI animations ---

export const GAMEOVER_UI = {
  TITLE_DROP_DURATION: 600,    // title entrance duration
  TITLE_DROP_EASE: 'Bounce.easeOut',
  SCORE_COUNTUP_DURATION: 800, // score count-up duration
  SCORE_COUNTUP_DELAY: 300,    // delay before count-up starts
  BTN_ENTRANCE_DELAY: 600,     // delay before button slides in
  BTN_ENTRANCE_DURATION: 400,
  BTN_GLOW_COLOR: 0x857dff,   // glow color for button hover
  BTN_GLOW_ALPHA: 0.3,
  BTN_GLOW_RADIUS: 8 * PX,    // glow spread
  // Floating background particles on game over screen
  BG_PARTICLE_COUNT: 20,
  BG_PARTICLE_SPEED: 15 * PX,
  BG_PARTICLE_COLORS: [0x6c63ff, 0x857dff, 0x44aaff, 0xffd700],
};
