import { describe, it, expect } from 'vitest';
import { colors } from '../color';
import { spacing } from '../spacing';
import { tailwindPreset } from '../tailwind-preset';

describe('tokens', () => {
  it('exposes neon accent cyan', () => {
    expect(colors.accent.cyan).toBe('#22D3EE');
  });

  it('exposes violet and turquoise accents', () => {
    expect(colors.accent.violet).toBe('#A855F7');
    expect(colors.accent.turquoise).toBe('#2DD4BF');
  });

  it('tailwind preset maps bg-base', () => {
    const colors = tailwindPreset.theme?.extend?.colors as Record<string, string> | undefined;
    expect(colors?.['bg-base']).toBe('#070A12');
  });

  it('state map has error color', () => {
    expect(colors.state.error).toBe('#FB7185');
  });

  it('spacing exposes 4 and 8', () => {
    expect(spacing[4]).toBe('1rem');
    expect(spacing[8]).toBe('2rem');
  });

  it('tailwind preset exposes backdrop-blur-glass', () => {
    const backdropBlur = tailwindPreset.theme?.extend?.backdropBlur as Record<string, string> | undefined;
    expect(backdropBlur?.glass).toBe('1rem');
  });
});