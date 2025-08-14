import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  eslint: {
    // Don't fail build on ESLint warnings during deployment
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Don't fail build on TypeScript errors during deployment  
    ignoreBuildErrors: false,
  },
}

export default nextConfig