import type { ScreensaverRenderer } from './types';

interface Star {
  x: number;
  y: number;
  z: number;
  pz: number;
}

export function createStarsRenderer(): ScreensaverRenderer {
  let ctx: CanvasRenderingContext2D;
  let w: number;
  let h: number;
  const stars: Star[] = [];
  const COUNT = 400;
  const SPEED = 8;

  return {
    name: 'Stars',

    init(c, width, height) {
      ctx = c;
      w = width;
      h = height;
      for (let i = 0; i < COUNT; i++) {
        stars.push({
          x: (Math.random() - 0.5) * w * 2,
          y: (Math.random() - 0.5) * h * 2,
          z: Math.random() * w,
          pz: 0,
        });
      }
    },

    render() {
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      for (const s of stars) {
        s.pz = s.z;
        s.z -= SPEED;

        if (s.z <= 0) {
          s.x = (Math.random() - 0.5) * w * 2;
          s.y = (Math.random() - 0.5) * h * 2;
          s.z = w;
          s.pz = w;
        }

        const sx = (s.x / s.z) * w + cx;
        const sy = (s.y / s.z) * h + cy;
        const px = (s.x / s.pz) * w + cx;
        const py = (s.y / s.pz) * h + cy;

        const brightness = 1 - s.z / w;
        ctx.strokeStyle = `rgba(255,255,255,${brightness})`;
        ctx.lineWidth = brightness * 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      }
    },

    destroy() {},
  };
}
