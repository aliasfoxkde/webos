import type { ScreensaverRenderer } from './types';

export function createWavesRenderer(): ScreensaverRenderer {
  let ctx: CanvasRenderingContext2D;
  let w: number;
  let h: number;

  const WAVES = [
    { color: 'rgba(56, 189, 248, 0.4)', amp: 50, freq: 0.008, speed: 0.02, yOff: 0.35 },
    { color: 'rgba(99, 102, 241, 0.35)', amp: 40, freq: 0.012, speed: -0.025, yOff: 0.45 },
    { color: 'rgba(168, 85, 247, 0.3)', amp: 60, freq: 0.006, speed: 0.015, yOff: 0.55 },
    { color: 'rgba(236, 72, 153, 0.25)', amp: 35, freq: 0.015, speed: -0.03, yOff: 0.65 },
    { color: 'rgba(52, 211, 153, 0.3)', amp: 45, freq: 0.01, speed: 0.022, yOff: 0.5 },
  ];

  return {
    name: 'Waves',

    init(c, width, height) {
      ctx = c;
      w = width;
      h = height;
    },

    render(time: number) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      const t = time * 0.001;

      for (const wave of WAVES) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 2) {
          const y =
            h * wave.yOff +
            Math.sin(x * wave.freq + t * wave.speed * 60) * wave.amp +
            Math.sin(x * wave.freq * 0.5 + t * wave.speed * 30) * wave.amp * 0.5;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = wave.color;
        ctx.fill();
      }
    },

    destroy() {},
  };
}
