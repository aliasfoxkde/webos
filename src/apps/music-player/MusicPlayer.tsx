import { useState, useEffect, useCallback, useRef } from 'react';

const PLAYLIST = [
  { id: '1', title: 'Sunrise Drive', artist: 'Synthwave Collective', duration: 234 },
  { id: '2', title: 'Midnight Rain', artist: 'Lo-Fi Dreams', duration: 198 },
  { id: '3', title: 'Digital Horizon', artist: 'Neon Pulse', duration: 267 },
  { id: '4', title: 'Cloud Nine', artist: 'Ambient Flow', duration: 312 },
  { id: '5', title: 'Retrograde', artist: 'Pixel Beats', duration: 185 },
  { id: '6', title: 'Ocean Waves', artist: 'Chill Studio', duration: 276 },
];

const ALBUM_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function MusicPlayer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentSong = PLAYLIST[currentIndex];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentSong.duration - 1) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? PLAYLIST.length - 1 : prev - 1));
    setCurrentTime(0);
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === PLAYLIST.length - 1 ? 0 : prev + 1));
    setCurrentTime(0);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  }, []);

  const handleSongSelect = useCallback((index: number) => {
    setCurrentIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--os-bg-primary)' }}>
      {/* Now Playing */}
      <div className="flex flex-col items-center px-6 pt-6 pb-4">
        {/* Album Art */}
        <div
          className="w-36 h-36 rounded-2xl flex items-center justify-center text-5xl shadow-lg mb-4"
          style={{ background: ALBUM_COLORS[currentIndex] }}
        >
          🎵
        </div>

        {/* Song Info */}
        <div className="text-center w-full">
          <div
            className="text-base font-semibold truncate"
            style={{ color: 'var(--os-text-primary)' }}
          >
            {currentSong.title}
          </div>
          <div
            className="text-sm truncate mt-0.5"
            style={{ color: 'var(--os-text-secondary)' }}
          >
            {currentSong.artist}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full mt-4">
          <input
            type="range"
            min={0}
            max={currentSong.duration}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--os-accent) ${
                (currentTime / currentSong.duration) * 100
              }%, var(--os-border) ${(currentTime / currentSong.duration) * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span
              className="text-xs"
              style={{ color: 'var(--os-text-muted)' }}
            >
              {formatTime(currentTime)}
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--os-text-muted)' }}
            >
              {formatTime(currentSong.duration)}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-6 mt-3">
          <button
            onClick={handlePrev}
            className="text-2xl hover:opacity-70 transition-opacity cursor-pointer"
            aria-label="Previous track"
          >
            ⏮️
          </button>
          <button
            onClick={togglePlay}
            className="text-3xl hover:opacity-70 transition-opacity cursor-pointer"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          <button
            onClick={handleNext}
            className="text-2xl hover:opacity-70 transition-opacity cursor-pointer"
            aria-label="Next track"
          >
            ⏭️
          </button>
        </div>
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-auto border-t" style={{ borderColor: 'var(--os-border)' }}>
        <div
          className="px-4 py-2 text-xs font-semibold"
          style={{ color: 'var(--os-text-muted)' }}
        >
          Playlist
        </div>
        {PLAYLIST.map((song, index) => (
          <button
            key={song.id}
            onClick={() => handleSongSelect(index)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer"
            style={{
              backgroundColor:
                index === currentIndex ? 'var(--os-bg-hover)' : 'transparent',
            }}
          >
            {/* Track number or playing indicator */}
            <div
              className="w-5 text-center text-xs shrink-0"
              style={{
                color:
                  index === currentIndex
                    ? 'var(--os-accent)'
                    : 'var(--os-text-muted)',
              }}
            >
              {index === currentIndex && isPlaying ? '♫' : index + 1}
            </div>

            {/* Song details */}
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-medium truncate"
                style={{
                  color:
                    index === currentIndex
                      ? 'var(--os-accent)'
                      : 'var(--os-text-primary)',
                }}
              >
                {song.title}
              </div>
              <div
                className="text-xs truncate"
                style={{ color: 'var(--os-text-secondary)' }}
              >
                {song.artist}
              </div>
            </div>

            {/* Duration */}
            <div
              className="text-xs shrink-0"
              style={{ color: 'var(--os-text-muted)' }}
            >
              {formatTime(song.duration)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
