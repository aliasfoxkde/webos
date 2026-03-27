import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MusicPlayer } from './MusicPlayer';

describe('MusicPlayer', () => {
  it('renders the current song title', () => {
    render(<MusicPlayer />);
    expect(screen.getAllByText('Sunrise Drive').length).toBeGreaterThanOrEqual(1);
  });

  it('renders the current artist', () => {
    render(<MusicPlayer />);
    expect(screen.getAllByText('Synthwave Collective').length).toBeGreaterThanOrEqual(1);
  });

  it('renders play/pause button', () => {
    render(<MusicPlayer />);
    expect(screen.getByLabelText('Play')).toBeDefined();
  });

  it('renders playlist header', () => {
    render(<MusicPlayer />);
    expect(screen.getByText('Playlist')).toBeDefined();
  });

  it('renders all 6 playlist songs', () => {
    render(<MusicPlayer />);
    expect(screen.getByText('Midnight Rain')).toBeDefined();
    expect(screen.getByText('Digital Horizon')).toBeDefined();
    expect(screen.getByText('Cloud Nine')).toBeDefined();
    expect(screen.getByText('Retrograde')).toBeDefined();
    expect(screen.getByText('Ocean Waves')).toBeDefined();
  });

  it('renders playback controls', () => {
    render(<MusicPlayer />);
    expect(screen.getByLabelText('Previous track')).toBeDefined();
    expect(screen.getByLabelText('Next track')).toBeDefined();
  });
});
