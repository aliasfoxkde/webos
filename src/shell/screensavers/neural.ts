import type { ScreensaverRenderer } from './types';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pulse: number;
}

export function createNeuralRenderer(): ScreensaverRenderer {
  let ctx: CanvasRenderingContext2D;
  let w: number;
  let h: number;
  const nodes: Node[] = [];
  const COUNT = 50;
  const CONNECT_DIST = 180;

  return {
    name: 'Neural',

    init(c, width, height) {
      ctx = c;
      w = width;
      h = height;
      for (let i = 0; i < COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    },

    render(time: number) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(0, 0, w, h);

      const t = time * 0.001;

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        n.x = Math.max(0, Math.min(w, n.x));
        n.y = Math.max(0, Math.min(h, n.y));
      }

      // connections with signal pulses
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const alpha = (1 - dist / CONNECT_DIST) * 0.6;
            const pulse = (Math.sin(t * 2 + i + j) + 1) * 0.5;

            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha * 0.4 + pulse * alpha * 0.3})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();

            // traveling signal dot
            if (pulse > 0.7) {
              const px = nodes[i].x + dx * pulse;
              const py = nodes[i].y + dy * pulse;
              ctx.beginPath();
              ctx.arc(px, py, 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(52, 211, 153, ${alpha})`;
              ctx.fill();
            }
          }
        }
      }

      // nodes
      for (const n of nodes) {
        const glow = (Math.sin(t * 3 + n.pulse) + 1) * 0.5;
        const radius = 3 + glow * 2;

        // glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${0.1 + glow * 0.15})`;
        ctx.fill();

        // core
        ctx.beginPath();
        ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52, 211, 153, ${0.6 + glow * 0.4})`;
        ctx.fill();
      }
    },

    destroy() {},
  };
}
