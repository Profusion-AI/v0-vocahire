/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we handle Prisma correctly in the build
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure Prisma client is transpiled for the build
      config.externals = [...config.externals, "prisma", "@prisma/client"]
    }
    return config
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Add any other Next.js config options here
}

module.exports = nextConfig
