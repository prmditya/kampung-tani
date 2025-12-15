import type { NextConfig } from 'next';
import withSerwistInit from '@serwist/next';

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
});

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'http://localhost:3001',
    'http://192.168.1.35',
    'http://192.168.1.35:3001',
  ],
};

export default withSerwist(nextConfig);
