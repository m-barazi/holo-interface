export const motion = {
  duration: { fast: '80ms', base: '200ms', slow: '320ms', xslow: '500ms' },
  easing: {
    soft: [0.4, 0, 0.2, 1] as const,
    emphasized: [0.2, 0, 0, 1] as const,
  },
  spring: { stiffness: 220, damping: 26 },
} as const;