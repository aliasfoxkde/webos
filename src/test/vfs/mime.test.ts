import { describe, it, expect } from 'vitest';
import { getMimeType, getExtension, isImage, isAudio, isText } from '@/vfs/mime';

describe('MIME detection', () => {
  describe('getMimeType', () => {
    it('should detect text types', () => {
      expect(getMimeType('file.txt')).toBe('text/plain');
      expect(getMimeType('file.md')).toBe('text/markdown');
      expect(getMimeType('file.html')).toBe('text/html');
      expect(getMimeType('file.css')).toBe('text/css');
      expect(getMimeType('file.js')).toBe('text/javascript');
      expect(getMimeType('file.ts')).toBe('text/typescript');
      expect(getMimeType('file.json')).toBe('application/json');
      expect(getMimeType('file.csv')).toBe('text/csv');
    });

    it('should detect image types', () => {
      expect(getMimeType('file.png')).toBe('image/png');
      expect(getMimeType('file.jpg')).toBe('image/jpeg');
      expect(getMimeType('file.jpeg')).toBe('image/jpeg');
      expect(getMimeType('file.gif')).toBe('image/gif');
      expect(getMimeType('file.svg')).toBe('image/svg+xml');
      expect(getMimeType('file.webp')).toBe('image/webp');
    });

    it('should detect document types', () => {
      expect(getMimeType('file.pdf')).toBe('application/pdf');
      expect(getMimeType('file.docx')).toBe('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    });

    it('should detect archive types', () => {
      expect(getMimeType('file.zip')).toBe('application/zip');
      expect(getMimeType('file.tar')).toBe('application/x-tar');
      expect(getMimeType('file.gz')).toBe('application/gzip');
    });

    it('should return octet-stream for unknown types', () => {
      expect(getMimeType('file.unknownext')).toBe('application/octet-stream');
      expect(getMimeType('noextension')).toBe('application/octet-stream');
    });

    it('should handle case-insensitive extensions', () => {
      expect(getMimeType('file.TXT')).toBe('text/plain');
      expect(getMimeType('file.PNG')).toBe('image/png');
      expect(getMimeType('file.JSON')).toBe('application/json');
    });
  });

  describe('getExtension', () => {
    it('should return extension for known MIME types', () => {
      expect(getExtension('text/plain')).toBe('.txt');
      expect(getExtension('image/png')).toBe('.png');
      expect(getExtension('application/json')).toBe('.json');
    });

    it('should return empty string for unknown MIME types', () => {
      expect(getExtension('unknown/type')).toBe('');
    });
  });

  describe('type checkers', () => {
    it('isImage', () => {
      expect(isImage('image/png')).toBe(true);
      expect(isImage('image/jpeg')).toBe(true);
      expect(isImage('text/plain')).toBe(false);
    });

    it('isAudio', () => {
      expect(isAudio('audio/mpeg')).toBe(true);
      expect(isAudio('audio/wav')).toBe(true);
      expect(isAudio('text/plain')).toBe(false);
    });

    it('isText', () => {
      expect(isText('text/plain')).toBe(true);
      expect(isText('application/json')).toBe(true);
      expect(isText('application/xml')).toBe(true);
      expect(isText('image/png')).toBe(false);
    });
  });
});
