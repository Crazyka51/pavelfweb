const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['localhost', 'fiserpavel.cz'],
    unoptimized: false,
  },
}

export default nextConfig
