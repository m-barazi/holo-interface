import { colors, spacing, radius, motion, glass, typography } from './index';
import type { Config } from 'tailwindcss';

export const tailwindPreset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        'bg-base': colors.bg.base,
        'bg-elev-1': colors.bg.elev1,
        'bg-elev-2': colors.bg.elev2,
        'accent-cyan': colors.accent.cyan,
        'accent-turquoise': colors.accent.turquoise,
        'accent-blue': colors.accent.blue,
        'accent-violet': colors.accent.violet,
        'state-online': colors.state.online,
        'state-thinking': colors.state.thinking,
        'state-answering': colors.state.answering,
        'state-error': colors.state.error,
        'state-offline': colors.state.offline,
        'txt-primary': colors.text.primary,
        'txt-secondary': colors.text.secondary,
        'txt-muted': colors.text.muted,
      },
      borderRadius: { sm: radius.sm, md: radius.md, lg: radius.lg, xl: radius.xl },
      backdropBlur: { glass: glass.blur, 'glass-strong': glass.blurStrong },
      fontFamily: {
        sans: typography.font.sans.split(','),
        mono: typography.font.mono.split(','),
      },
      transitionDuration: {
        fast: motion.duration.fast,
        base: motion.duration.base,
        slow: motion.duration.slow,
      },
      spacing,
    },
  },
};