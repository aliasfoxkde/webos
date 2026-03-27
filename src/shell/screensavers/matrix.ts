import type { ScreensaverRenderer } from './types';

export function createMatrixRenderer(): ScreensaverRenderer {
  let ctx: CanvasRenderingContext2D;
  let w: number;
  let h: number;
  const columns: number[] = [];
  const FONT_SIZE = 14;
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()';

  return {
    name: 'Matrix',

    init(c, width, height) {
      ctx = c;
      w = width;
      h = height;
      const count = Math.ceil(w / FONT_SIZE);
      for (let i = 0; i < count; i++) {
        columns.push(Math.random() * h / FONT_SIZE * -1);
      }
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
    },

    render() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${FONT_SIZE}px monospace`;

      for (let i = 0; i < columns.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const x = i * FONT_SIZE;
        const y = columns[i] * FONT_SIZE;

        // Lead character is brighter
        ctx.fillStyle = '#fff';
        ctx.fillText(char, x, y);

        // Previous characters in green
        ctx.fillStyle = '#0f0';
        ctx.fillText(CHARS[Math.floor(Math.random() * CHARS.length)], x, y - FONT_SIZE);

        columns[i]++;

        if (y > h && Math.random() > 0.975) {
          columns[i] = 0;
        }
      }
    },

    destroy() {},
  };
}
