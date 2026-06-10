/** @type {import('next').NextConfig} */
import bundleAnalyzer from "@next/bundle-analyzer";
import withPWAInit from "@ducanh2912/next-pwa";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "gstatic-fonts-cache",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
          },
        },
      },
      {
        urlPattern: /\/_next\/image\?url=.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\/_next\/static.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
          },
        },
      },
      {
        urlPattern: /\.(?:webp|jpg|jpeg|png|svg|gif|webm|mp4)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
    ],
  },
});

const nextConfig = {
  // Make sure there are no module format transformations causing issues
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode for improved development experience

  // Pin workspace root so Next.js doesn't get confused by parent lockfiles
  outputFileTracingRoot: __dirname,
  // Performance optimizations
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: [
      "framer-motion",
      "react-icons",
      "lucide-react",
      "@heroicons/react",
    ], // Tree-shake these packages
  },

  // External packages for server components
  serverExternalPackages: ["highlight.js"], // Keep heavy packages external

  // Compiler optimizations
  compiler: {
    // Only strip non-critical console calls in production; keep error/warn for observability
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // Headers for performance
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/fonts/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.itch.zone",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/**",
      },
    ],
    formats: ["image/webp", "image/avif"], // Use modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Optimize for common screen sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
  },

  // Webpack config reserved for future custom loaders if needed
  webpack: (config) => {
    return config;
  },
};

export default withBundleAnalyzer(withPWA(nextConfig));
