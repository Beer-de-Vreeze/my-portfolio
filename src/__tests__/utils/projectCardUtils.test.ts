import { describe, it, expect } from 'vitest';
import {
  isYouTubeUrl,
  extractYouTubeVideoId,
  formatFileSize,
} from '@/components/cards/ProjectCard/utils';

describe('isYouTubeUrl', () => {
  it('returns true for a standard youtube.com watch URL', () => {
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
  });

  it('returns true for a youtu.be short URL', () => {
    expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
  });

  it('returns true for an embed URL', () => {
    expect(isYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true);
  });

  it('returns false for a non-YouTube URL', () => {
    expect(isYouTubeUrl('https://vimeo.com/123456')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isYouTubeUrl('')).toBe(false);
  });
});

describe('extractYouTubeVideoId', () => {
  it('extracts ID from a standard watch URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from a youtu.be short URL', () => {
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts ID from an embed URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('returns null for a non-YouTube URL', () => {
    expect(extractYouTubeVideoId('https://vimeo.com/123456')).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(extractYouTubeVideoId('')).toBeNull();
  });
});

describe('formatFileSize', () => {
  it('formats 0 bytes', () => {
    expect(formatFileSize(0)).toBe('0 Bytes');
  });

  it('formats kilobytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
  });

  it('formats megabytes correctly', () => {
    expect(formatFileSize(1024 * 1024)).toBe('1 MB');
  });

  it('formats gigabytes correctly', () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
  });

  it('formats fractional sizes', () => {
    expect(formatFileSize(1500)).toBe('1.46 KB');
  });
});
