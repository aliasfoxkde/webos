import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VoiceRecorder } from './VoiceRecorder';

// Mock MediaRecorder
const mockMediaRecorder = {
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null as any,
  onstop: null as any,
  state: 'inactive',
};

vi.stubGlobal('MediaRecorder', vi.fn().mockImplementation(() => mockMediaRecorder));

describe('VoiceRecorder', () => {
  it('renders the record button', () => {
    render(<VoiceRecorder />);
    expect(screen.getByText('Tap to record')).toBeDefined();
  });

  it('renders the timer display', () => {
    render(<VoiceRecorder />);
    expect(screen.getByText('00:00')).toBeDefined();
  });

  it('renders empty state message', () => {
    render(<VoiceRecorder />);
    expect(
      screen.getByText('No recordings yet. Tap the button above to start recording.'),
    ).toBeDefined();
  });
});
