import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusPill } from '../StatusPill';

describe('StatusPill', () => {
  it('renders the provided label', () => {
    render(<StatusPill state="online" label="Online" />);
    expect(screen.getByText('Online')).toBeTruthy();
  });

  it('exposes data-state attribute for error', () => {
    const { container } = render(<StatusPill state="error" label="Fehler" />);
    expect(container.querySelector('[data-state="error"]')).toBeTruthy();
  });

  it('renders an animated indicator dot', () => {
    const { container } = render(<StatusPill state="thinking" label="Denken" />);
    expect(container.querySelector('span.rounded-full')).toBeTruthy();
  });
});