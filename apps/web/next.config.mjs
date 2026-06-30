import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./app/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  // Linting läuft während next build (Web-ESLint-Config: apps/web/.eslintrc.cjs).
  transpilePackages: ['@holo/ui', '@holo/tokens', '@holo/shared', '@holo/three-avatar'],
};

export default withNextIntl(nextConfig);