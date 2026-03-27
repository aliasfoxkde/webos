import { useState, useRef } from 'react';

interface Photo {
  id: string;
  name: string;
  /** Placeholder color so the grid looks populated */
  color: string;
}

const PLACEHOLDER_PHOTOS: Photo[] = [
  { id: '1', name: 'Sunset Beach', color: '#f97316' },
  { id: '2', name: 'Mountain View', color: '#22c55e' },
  { id: '3', name: 'City Lights', color: '#6366f1' },
  { id: '4', name: 'Ocean Waves', color: '#3b82f6' },
  { id: '5', name: 'Forest Trail', color: '#16a34a' },
  { id: '6', name: 'Desert Dunes', color: '#eab308' },
];

const GRID_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b',
];

export function Photos() {
  const [photos, setPhotos] = useState<Photo[]>(PLACEHOLDER_PHOTOS);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: Photo[] = Array.from(files).map((file, i) => ({
      id: crypto.randomUUID(),
      name: file.name,
      color: GRID_COLORS[(photos.length + i) % GRID_COLORS.length],
    }));

    setPhotos((prev) => [...prev, ...newPhotos]);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  return (
    <div
      className="flex h-full flex-col"
      style={{ backgroundColor: 'var(--os-bg-primary)' }}
    >
      {/* Toolbar */}
      <div
        className="flex items-center justify-between border-b px-4 py-2"
        style={{
          backgroundColor: 'var(--os-bg-secondary)',
          borderColor: 'var(--os-border)',
        }}
      >
        <span
          className="text-sm font-semibold"
          style={{ color: 'var(--os-text-primary)' }}
        >
          Photos ({photos.length})
        </span>
        <button
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--os-accent)' }}
          onClick={handleUploadClick}
        >
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ backgroundColor: 'var(--os-bg-tertiary)' }}
            >
              {'\uD83D\uDDBC\uFE0F'}
            </div>
            <div className="text-center">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--os-text-primary)' }}
              >
                No photos yet
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--os-text-muted)' }}
              >
                Upload images to get started
              </p>
            </div>
            <button
              className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--os-accent)' }}
              onClick={handleUploadClick}
            >
              Upload Photos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                style={{
                  backgroundColor: photo.color,
                }}
              >
                {/* Placeholder gradient */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 60%)`,
                  }}
                />
                {/* Image icon overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="opacity-40"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                    <circle cx="8.5" cy="8.5" r="1.5" fill="white" />
                    <path
                      d="M21 15L16 10L5 21"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {/* Name label on hover */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-2 py-1.5 text-xs font-medium truncate transition-opacity opacity-0 group-hover:opacity-100"
                  style={{
                    color: 'white',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                  }}
                >
                  {photo.name}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
