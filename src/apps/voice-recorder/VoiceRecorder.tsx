import { useState, useEffect, useRef, useCallback } from 'react';

interface Recording {
  id: string;
  url: string;
  duration: number;
  timestamp: number;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function VoiceRecorder() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [unsupported, setUnsupported] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (typeof MediaRecorder === 'undefined') {
      setUnsupported(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      recordings.forEach((r) => URL.revokeObjectURL(r.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setError(null);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        if (duration > 0) {
          setRecordings((prev) => [
            {
              id: crypto.randomUUID(),
              url,
              duration,
              timestamp: Date.now(),
            },
            ...prev,
          ]);
        } else {
          URL.revokeObjectURL(url);
        }

        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setTimer(0);

      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone access denied. Please allow microphone permissions in your browser settings.'
          : 'Could not access microphone. Please check your device settings.';
      setError(message);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
    setTimer(0);
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  const deleteRecording = useCallback(
    (id: string) => {
      setRecordings((prev) => {
        const rec = prev.find((r) => r.id === id);
        if (rec) URL.revokeObjectURL(rec.url);
        return prev.filter((r) => r.id !== id);
      });
    },
    [],
  );

  const playRecording = useCallback((rec: Recording) => {
    if (playingId === rec.id) return;
    const audio = new Audio(rec.url);
    setPlayingId(rec.id);
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => setPlayingId(null);
    audio.play().catch(() => setPlayingId(null));
  }, [playingId]);

  // Unsupported browser
  if (unsupported) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-3 p-6"
        style={{ backgroundColor: 'var(--os-bg-primary)' }}
      >
        <div
          className="text-4xl"
          style={{ color: 'var(--os-text-muted)' }}
        >
          &#127908;
        </div>
        <p
          className="text-center text-sm"
          style={{ color: 'var(--os-text-muted)' }}
        >
          MediaRecorder API is not supported in this browser.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Top section: timer + record button */}
      <div className="flex flex-col items-center gap-4 pt-8 pb-4">
        {/* Timer */}
        <div
          className={`text-5xl font-bold tabular-nums tracking-wide ${isRecording ? 'animate-pulse' : ''}`}
          style={{ color: isRecording ? 'var(--os-error)' : 'var(--os-text-primary)' }}
        >
          {formatDuration(timer)}
        </div>

        {/* Record button */}
        <button
          onClick={toggleRecording}
          disabled={!!error}
          className="flex h-16 w-16 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: isRecording ? 'var(--os-error)' : '#dc2626',
            boxShadow: isRecording
              ? '0 0 0 0 rgba(220, 38, 38, 0.4)'
              : '0 2px 8px rgba(0, 0, 0, 0.15)',
            animation: isRecording ? 'pulse-ring 1.5s ease-out infinite' : undefined,
          }}
        >
          {isRecording ? (
            <div
              className="h-5 w-5 rounded-sm"
              style={{ backgroundColor: '#ffffff' }}
            />
          ) : (
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: '#ffffff' }}
            />
          )}
        </button>

        <span
          className="text-xs"
          style={{ color: 'var(--os-text-muted)' }}
        >
          {isRecording ? 'Tap to stop' : 'Tap to record'}
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div
          className="mx-4 rounded-lg px-4 py-3 text-center text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--os-error)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          {error}
        </div>
      )}

      {/* Recordings list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {recordings.length === 0 && !isRecording && (
          <p
            className="mt-4 text-center text-sm"
            style={{ color: 'var(--os-text-muted)' }}
          >
            No recordings yet. Tap the button above to start recording.
          </p>
        )}

        {recordings.length > 0 && (
          <div className="mt-2 space-y-2">
            <div
              className="mb-2 text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--os-text-muted)' }}
            >
              Recordings ({recordings.length})
            </div>
            {recordings.map((rec, index) => (
              <div
                key={rec.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5"
                style={{ backgroundColor: 'var(--os-bg-secondary)' }}
              >
                {/* Play button */}
                <button
                  onClick={() => playRecording(rec)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:opacity-80 cursor-pointer"
                  style={{
                    backgroundColor:
                      playingId === rec.id ? 'var(--os-accent)' : 'var(--os-bg-tertiary)',
                    color: playingId === rec.id ? '#ffffff' : 'var(--os-text-primary)',
                  }}
                >
                  <span className="text-sm leading-none">
                    {playingId === rec.id ? '\u23F8' : '\u25B6'}
                  </span>
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className="text-sm font-medium"
                    style={{ color: 'var(--os-text-primary)' }}
                  >
                    Recording {recordings.length - index}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--os-text-muted)' }}
                  >
                    {formatDuration(rec.duration)}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => deleteRecording(rec.id)}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:opacity-80 cursor-pointer"
                  style={{
                    backgroundColor: 'var(--os-bg-tertiary)',
                  }}
                  title="Delete recording"
                >
                  <span className="text-sm leading-none">{'\uD83D\uDDD1\uFE0F'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
