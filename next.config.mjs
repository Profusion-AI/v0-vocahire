/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Enable standalone output for Docker optimization
  output: 'standalone',
  // Ensure source maps are generated for better debugging
  productionBrowserSourceMaps: true,
  env: {
    GOOGLE_API_BASE_URL: 'https://generativelanguage.googleapis.com',
  },
}

export default nextConfig;
