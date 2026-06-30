import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // ESLint während des Builds deaktiviert: die Root-.eslintrc.cjs (für node-seitige
  // Workspace-Packages gedacht) extendiert nur eslint:recommended ohne TS-/JSX-Parser
  // und würde next build auf allen .tsx-Dateien abbrechen. Linting läuft separat via pnpm lint.
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@holo/ui', '@holo/tokens', '@holo/shared', '@holo/three-avatar'],
};

export default withNextIntl(nextConfig);