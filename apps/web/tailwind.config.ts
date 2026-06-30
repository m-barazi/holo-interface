import type { Config } from 'tailwindcss';
import { tailwindPreset } from '@holo/tokens';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './stores/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
    '../../packages/three-avatar/src/**/*.{ts,tsx}',
  ],
  presets: [tailwindPreset as Config],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;