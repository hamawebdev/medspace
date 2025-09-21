import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: "standalone",

  // TypeScript: allow builds to complete even with type errors
  typescript: {
    ignoreBuildErrors: true,
  },

  // Disable ESLint during builds to avoid blocking on lint errors
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'med-cortex.com',
        port: '',
        pathname: '/api/v1/media/**',
      },
    ],
  },



  // Redirect common typos to the correct routes
  async redirects() {
    return [
      // Fix typo: /admin/quetions -> /admin/questions
      {
        source: "/admin/quetions",
        destination: "/admin/questions",
        permanent: false,
      },
      {
        source: "/admin/quetions/:path*",
        destination: "/admin/questions/:path*",
        permanent: false,
      },
    ];
  },

  // Enhanced security headers for production
  async headers() {
    const securityHeaders = [
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ];

    // Add HSTS header only in production
    if (isProduction) {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      });
    }

    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
