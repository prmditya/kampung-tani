/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable hot reload in Docker
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
