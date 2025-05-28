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
  // Disable WebAssembly experiments to avoid build issues
  experiments: {
    asyncWebAssembly: true,
    // This is required to use WebAssembly in Next.js
    wasm: true,
  },
}

export default nextConfig;
