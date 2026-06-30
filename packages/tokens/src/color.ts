export const colors = {
  bg: { base: '#070A12', elev1: '#0C1220', elev2: '#121A2E' },
  accent: { cyan: '#22D3EE', turquoise: '#2DD4BF', blue: '#3B82F6', violet: '#A855F7' },
  state: {
    online: '#2DD4BF',
    thinking: '#A855F7',
    answering: '#22D3EE',
    error: '#FB7185',
    offline: '#64748B',
    listening: '#2DD4BF',
  },
  text: { primary: '#E6EDF7', secondary: '#94A3B8', muted: '#64748B' },
  glass: {
    surface: 'rgba(255,255,255,0.05)',
    strong: 'rgba(255,255,255,0.10)',
    border: 'rgba(255,255,255,0.08)',
  },
  light: {
    bg: { base: '#F4F7FB', elev1: '#FFFFFF', elev2: '#EAEFF7' },
    text: { primary: '#0C1220', secondary: '#475569', muted: '#94A3B8' },
  },
} as const;