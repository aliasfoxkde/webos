import { useState, useEffect, useCallback, useRef } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string; // object URL or blob URL
  duration: number; // seconds, 0 if unknown
}

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

function extractArtist(filename: string): string {
  // Remove extension, use filename as title
  const name = filename.replace(/\.[^.]+$/, '');
  return name;
}

export function MusicPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlsRef = useRef<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration || 0);
    });

    audio.addEventListener('ended', () => {
      handleNext();
    });

    audio.addEventListener('durationchange', () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
        // Update track duration in the list
        setTracks((prev) => {
          const updated = [...prev];
          if (updated[currentIndex]) {
            updated[currentIndex] = { ...updated[currentIndex], duration: audio.duration };
          }
          return updated;
        });
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Load track when index changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    const track = tracks[currentIndex];
    if (!track) return;

    audio.src = track.url;
    setCurrentTime(0);
    setDuration(track.duration || 0);

    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentIndex, tracks]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || tracks.length === 0) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [isPlaying, tracks]);

  const handlePrev = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIndex((prev) => (prev === 0 ? tracks.length - 1 : prev - 1));
  }, [tracks]);

  const handleNext = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIndex((prev) => (prev === tracks.length - 1 ? 0 : prev + 1));
  }, [tracks]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  }, []);

  const handleSongSelect = useCallback((index: number) => {
    setCurrentIndex(index);
    setIsPlaying(true);
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  }, []);

  const handleUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const audioFiles = Array.from(files).filter((f) => f.type.startsWith('audio/'));
    if (audioFiles.length === 0) return;

    const newTracks: Track[] = audioFiles.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      return {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: extractArtist(file.name),
        url,
        duration: 0,
      };
    });

    setTracks((prev) => {
      const updated = [...prev, ...newTracks];
      // If first upload, select it
      if (prev.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(true);
      }
      return updated;
    });

    e.target.value = '';
  };

  const handleDeleteTrack = (id: string) => {
    setTracks((prev) => {
      const track = prev.find((t) => t.id === id);
      if (track) {
        URL.revokeObjectURL(track.url);
        objectUrlsRef.current = objectUrlsRef.current.filter((u) => u !== track.url);
      }
      const filtered = prev.filter((t) => t.id !== id);
      // Adjust current index
      if (filtered.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.src = '';
        }
      } else if (currentIndex >= filtered.length) {
        setCurrentIndex(filtered.length - 1);
      }
      return filtered;
    });
  };

  const currentTrack = tracks[currentIndex];

  return (
    <div className="flex h-full flex-col" style={{ backgroundColor: 'var(--os-bg-primary)' }}>
      {/* Now Playing */}
      <div className="flex flex-col items-center px-6 pt-6 pb-4">
        {currentTrack ? (
          <>
            {/* Album Art */}
            <div
              className="w-36 h-36 rounded-2xl flex items-center justify-center text-5xl shadow-lg mb-4"
              style={{ background: ALBUM_COLORS[currentIndex % ALBUM_COLORS.length] }}
            >
              🎵
            </div>

            {/* Song Info */}
            <div className="text-center w-full">
              <div
                className="text-base font-semibold truncate"
                style={{ color: 'var(--os-text-primary)' }}
              >
                {currentTrack.title}
              </div>
              <div
                className="text-sm truncate mt-0.5"
                style={{ color: 'var(--os-text-secondary)' }}
              >
                {currentTrack.artist}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full mt-4">
              <input
                type="range"
                min={0}
                max={duration || 1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--os-accent) ${
                    duration > 0 ? (currentTime / duration) * 100 : 0
                  }%, var(--os-border) ${duration > 0 ? (currentTime / duration) * 100 : 0}%)`,
                }}
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs" style={{ color: 'var(--os-text-muted)' }}>
                  {formatTime(currentTime)}
                </span>
                <span className="text-xs" style={{ color: 'var(--os-text-muted)' }}>
                  {formatTime(duration || currentTrack.duration)}
                </span>
              </div>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-2 mt-2 w-full">
              <span className="text-xs" style={{ color: 'var(--os-text-muted)' }}>🔈</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={handleVolumeChange}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--os-accent) ${volume * 100}%, var(--os-border) ${volume * 100}%)`,
                }}
              />
              <span className="text-xs" style={{ color: 'var(--os-text-muted)' }}>🔊</span>
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ backgroundColor: 'var(--os-bg-tertiary)' }}
            >
              🎵
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: 'var(--os-text-primary)' }}>
                No music yet
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--os-text-muted)' }}>
                Upload audio files to get started
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Playlist */}
      <div className="flex-1 overflow-auto border-t" style={{ borderColor: 'var(--os-border)' }}>
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--os-text-muted)' }}>
            Playlist ({tracks.length})
          </span>
          <button
            className="px-2 py-0.5 text-[10px] rounded cursor-pointer"
            style={{ color: 'var(--os-accent)', backgroundColor: 'var(--os-accent-muted)' }}
            onClick={handleUpload}
          >
            + Add
          </button>
        </div>
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-xs" style={{ color: 'var(--os-text-muted)' }}>
              Upload MP3, WAV, OGG, or other audio files
            </p>
          </div>
        ) : (
          tracks.map((track, index) => (
            <button
              key={track.id}
              onClick={() => handleSongSelect(index)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors cursor-pointer group"
              style={{
                backgroundColor:
                  index === currentIndex ? 'var(--os-bg-hover)' : 'transparent',
              }}
            >
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
                  {track.title}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: 'var(--os-text-secondary)' }}
                >
                  {track.artist}
                </div>
              </div>

              <div
                className="text-xs shrink-0"
                style={{ color: 'var(--os-text-muted)' }}
              >
                {formatTime(track.duration)}
              </div>

              {/* Delete button */}
              <button
                className="opacity-0 group-hover:opacity-100 text-xs w-4 h-4 flex items-center justify-center rounded-full shrink-0 cursor-pointer"
                style={{ color: 'white', backgroundColor: 'rgba(239,68,68,0.8)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTrack(track.id);
                }}
              >
                x
              </button>
            </button>
          ))
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
