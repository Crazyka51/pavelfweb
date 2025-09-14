let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/**
 * @type {import('next').NextConfig & {
 *   experimental?: {
 *     newNextLinkBehavior?: boolean;
 *     allowedDevOrigins?: string[];
 *   };
 * }}
 */
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
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    FACEBOOK_ACCESS_TOKEN: process.env.FACEBOOK_ACCESS_TOKEN,
    FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    FACEBOOK_PAGE_ID: process.env.FACEBOOK_PAGE_ID,
  },
  // Konfigurace pro vývojové prostředí
  experimental: {},
  // Vynutit HTTPS v produkčním prostředí - bez assetPrefix pro předejití CORS problémům
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://fiserpavel.cz' : '',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ]
      },
      // CORS hlavičky pro font soubory - umožňuje přístup mezi www a non-www doménami
      {
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400'
          }
        ]
      },
      // CORS hlavičky pro všechny statické soubory Next.js
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, HEAD, OPTIONS'
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin'
          }
        ]
      },
      // CORS hlavičky pro API auth endpointy
      {
        source: '/api/admin/auth/:path*',
        headers: [
          {
            // V produkci dynamicky nastavíme hlavičku podle Origin, 
            // Ve vývojovém prostředí povolíme localhost
            key: 'Access-Control-Allow-Origin',
            // Nemůžeme použít dynamickou hodnotu '*', protože pak by nefungovalo 'credentials: include'
            // Řešení: middleware bude dynamicky upravovat tuto hodnotu podle Origin hlavičky
            value: process.env.NODE_ENV === 'production'
              ? 'https://www.fiserpavel.cz'
              : 'http://localhost:3000'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization'
          },
          {
            key: 'Vary',
            value: 'Origin'
          }
        ]
      }
    ]
  }
}

mergeConfig(nextConfig, userConfig)

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      }
    } else {
      nextConfig[key] = userConfig[key]
    }
  }
}

export default nextConfig
