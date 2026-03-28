import { useState, useRef, useEffect, useCallback } from 'react';
import { writeFile } from '@/vfs/vfs';

export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [mirrored, setMirrored] = useState(true);
  const [flash, setFlash] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setError(null);
    } catch {
      setError('Camera access denied');
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  const takePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (mirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const name = `capture-${Date.now()}.png`;
        await writeFile(`/home/Pictures/${name}`, buffer.buffer);
      };
      reader.readAsDataURL(blob);
    }, 'image/png');

    setFlash(true);
    setTimeout(() => setFlash(false), 300);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white gap-4">
        <span className="text-5xl">📷</span>
        <p className="text-sm text-red-400">{error}</p>
        <button
          className="px-4 py-2 bg-[var(--os-accent)] text-white rounded-lg text-sm"
          onClick={startCamera}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="max-w-full max-h-full"
        style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
      />

      {flash && (
        <div className="absolute inset-0 bg-white animate-pulse pointer-events-none" />
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute bottom-4 flex items-center gap-4">
        <button
          className="w-10 h-10 rounded-full bg-[var(--os-bg-secondary)] text-white text-sm flex items-center justify-center"
          onClick={() => setMirrored((m) => !m)}
          title="Toggle mirror"
        >
          ↔
        </button>
        <button
          className="w-14 h-14 rounded-full bg-white border-4 border-gray-300 hover:border-[var(--os-accent)] transition-colors"
          onClick={takePhoto}
          aria-label="Take Photo"
        />
      </div>
    </div>
  );
}
