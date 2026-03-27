import type { ScreensaverRenderer } from './types';

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  color: string;
  opacity: number;
}

export function createBubblesRenderer(): ScreensaverRenderer {
  let ctx: CanvasRenderingContext2D;
  let w: number;
  let h: number;
  let bubbles: Bubble[] = [];
  let animId = 0;

  const COLORS = [
    'rgba(56, 189, 248, ',   // sky-400
    'rgba(99, 102, 241, ',   // indigo-500
    'rgba(168, 85, 247, ',   // purple-500
    'rgba(236, 72, 153, ',   // pink-500
    'rgba(52, 211, 153, ',   // emerald-400
    'rgba(251, 191, 36, ',   // amber-400
  ];

  function spawn(): Bubble {
    return {
      x: Math.random() * w,
      y: h + Math.random() * 40,
      r: 6 + Math.random() * 24,
      speed: 0.4 + Math.random() * 1.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.25 + Math.random() * 0.45,
    };
  }

  return {
    name: 'Bubbles',

    init(c, width, height) {
      ctx = c;
      w = width;
      h = height;
      bubbles = Array.from({ length: 35 }, spawn);
    },

    render() {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);

      for (const b of bubbles) {
        b.y -= b.speed;
        b.x += Math.sin(b.y * 0.01) * 0.3;

        if (b.y + b.r < 0) {
          Object.assign(b, spawn());
        }

        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.color + b.opacity + ')';
        ctx.fill();

        // highlight
        ctx.beginPath();
        ctx.arc(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${b.opacity * 0.35})`;
        ctx.fill();
      }
    },

    destroy() {
      cancelAnimationFrame(animId);
    },
  };
}
