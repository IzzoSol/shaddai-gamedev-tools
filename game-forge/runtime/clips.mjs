// Sprite sheets and animation clips (NEXUS) — works with any 2D renderer or a three.js plane's UV offset.
//
//   const sheet = gridSheet({ cols: 8, rows: 4, frameW: 64, frameH: 64 });
//   const walk  = clip(sheet, { row: 1, from: 0, to: 5, fps: 12, mode: 'loop' });
//   const frame = walk.at(timeSeconds);   // → { index, x, y, w, h, u, v, uw, vh }
//
// Playback is a pure function of time, so replays, pausing, and rewinding are free.

export function gridSheet({ cols, rows, frameW, frameH }) {
  return { cols, rows, frameW, frameH, width: cols * frameW, height: rows * frameH };
}

export function frameRect(sheet, index) {
  const col = index % sheet.cols, row = Math.floor(index / sheet.cols);
  return {
    index, x: col * sheet.frameW, y: row * sheet.frameH, w: sheet.frameW, h: sheet.frameH,
    // UVs for a texture whose origin is bottom-left (three.js): v counts up from the bottom.
    u: (col * sheet.frameW) / sheet.width,
    v: 1 - ((row + 1) * sheet.frameH) / sheet.height,
    uw: sheet.frameW / sheet.width, vh: sheet.frameH / sheet.height,
  };
}

export function clip(sheet, { row = 0, from = 0, to, fps = 12, mode = 'loop' }) {
  const first = row * sheet.cols + from;
  const count = (to ?? sheet.cols - 1) - from + 1;
  const duration = count / fps;
  return {
    count, duration,
    at(t) {
      let n = Math.floor(Math.max(0, t) * fps);
      if (mode === 'once') n = Math.min(n, count - 1);
      else if (mode === 'pingpong' && count > 1) { const span = count * 2 - 2; n %= span; if (n >= count) n = span - n; }
      else n %= count;
      return frameRect(sheet, first + n);
    },
    done: (t) => mode === 'once' && t >= duration,
  };
}
