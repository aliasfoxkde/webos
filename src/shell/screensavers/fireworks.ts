import type { ScreensaverRenderer } from './types';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export function createFireworksRenderer(): ScreensaverRenderer {
  let ctx: CanvasRenderingContext2D;
  let w: number;
  let h: number;
  const sparks: Spark[] = [];
  let nextLaunch = 0;

  const COLORS = [
    '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3',
    '#54a0ff', '#5f27cd', '#01a3a4', '#f368e0',
    '#ff9f43', '#ee5a24', '#0abde3', '#10ac84',
  ];

  function launch(time: number): void {
    const cx = w * 0.2 + Math.random() * w * 0.6;
    const cy = h * 0.15 + Math.random() * h * 0.35;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const count = 40 + Math.floor(Math.random() * 40);

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.3;
      const speed = 1.5 + Math.random() * 3;
      sparks.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color,
        size: 1.5 + Math.random() * 1.5,
      });
    }

    nextLaunch = time + 1500 + Math.random() * 2500;
  }

  return {
    name: 'Fireworks',

    init(c, width, height) {
      ctx = c;
      w = width;
      h = height;
      nextLaunch = 0;
    },

    render(time: number) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, w, h);

      if (time > nextLaunch) {
        launch(time);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.03; // gravity
        s.vx *= 0.99;
        s.life -= 0.008;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },

    destroy() {
      sparks.length = 0;
    },
  };
}
