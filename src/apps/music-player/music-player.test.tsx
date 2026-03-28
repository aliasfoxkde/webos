import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MusicPlayer } from './MusicPlayer';

describe('MusicPlayer', () => {
  it('renders empty state when no tracks', () => {
    render(<MusicPlayer />);
    expect(screen.getByText('No music yet')).toBeDefined();
  });

  it('renders upload prompt', () => {
    render(<MusicPlayer />);
    expect(screen.getByText('Upload audio files to get started')).toBeDefined();
  });

  it('renders playlist header with count', () => {
    render(<MusicPlayer />);
    expect(screen.getByText(/Playlist \(0\)/)).toBeDefined();
  });

  it('renders add button', () => {
    render(<MusicPlayer />);
    expect(screen.getByText('+ Add')).toBeDefined();
  });

  it('has a file input for audio upload', () => {
    const { container } = render(<MusicPlayer />);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.accept).toBe('audio/*');
    expect(input.multiple).toBe(true);
  });

  it('renders music icon', () => {
    render(<MusicPlayer />);
    expect(screen.getAllByText('🎵').length).toBeGreaterThanOrEqual(1);
  });
});
