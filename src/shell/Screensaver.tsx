import { useEffect, useRef, useCallback, useState } from 'react';
import { useScreensaverStore } from '@/stores/screensaver-store';
import { createScreensaver } from '@/shell/screensavers';
import type { ScreensaverRenderer } from '@/shell/screensavers';

export function Screensaver() {
  const enabled = useScreensaverStore((s) => s.enabled);
  const type = useScreensaverStore((s) => s.type);
  const timeout = useScreensaverStore((s) => s.idleTimeoutSeconds);

  const [visible, setVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<ScreensaverRenderer | null>(null);
  const rafRef = useRef<number>(0);
  const timerRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const dismiss = useCallback(() => {
    if (!visible) return;
    setVisible(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (rendererRef.current) {
      rendererRef.current.destroy();
      rendererRef.current = null;
    }
    resetIdle();
  }, [visible]);

  const resetIdle = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      startTimeRef.current = performance.now() + Math.random() * 5000;
      setVisible(true);
    }, timeout * 1000);
  }, [timeout]);

  // Reset idle timer on user activity
  useEffect(() => {
    if (!enabled) return;

    const onActivity = () => {
      if (visible) {
        dismiss();
      } else {
        resetIdle();
      }
    };

    window.addEventListener('mousemove', onActivity);
    window.addEventListener('mousedown', onActivity);
    window.addEventListener('keydown', onActivity);
    window.addEventListener('touchstart', onActivity);

    resetIdle();

    return () => {
      window.removeEventListener('mousemove', onActivity);
      window.removeEventListener('mousedown', onActivity);
      window.removeEventListener('keydown', onActivity);
      window.removeEventListener('touchstart', onActivity);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, visible, dismiss, resetIdle]);

  // Animation loop
  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderer = createScreensaver(type);
    renderer.init(ctx, canvas.width, canvas.height);
    rendererRef.current = renderer;

    const loop = (time: number) => {
      renderer.render(time - startTimeRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      renderer.destroy();
      rendererRef.current = null;
    };
  }, [visible, type]);

  if (!enabled || !visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{
        zIndex: 99998,
        cursor: 'none',
      }}
    />
  );
}
