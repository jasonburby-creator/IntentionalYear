/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Don't fail Vercel builds on lint warnings.
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
