/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Allow larger file uploads (50MB)
  experimental: {
    bodySizeLimit: '50mb',
  },
  webpack: (config) => {
    // Avoid bundling native module in serverless functions
    config.externals = config.externals || []
    config.externals.push({ 'better-sqlite3': 'commonjs better-sqlite3' })
    return config
  },
}

export default nextConfig
