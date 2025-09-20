import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Dangerously allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
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

  // Optional: Add security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
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
        ],
      },
    ];
  },
};

export default nextConfig;
