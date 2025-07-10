/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make sure there are no module format transformations causing issues
  output: "standalone", // Optimized for Vercel deployment
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode for improved development experience

  // Performance optimizations
  experimental: {
    optimizeCss: true, // Enable CSS optimization
    optimizePackageImports: ["framer-motion", "react-icons"], // Tree-shake these packages
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production", // Remove console logs in production
  },

  // Image optimization
  images: {
    domains: ["img.itch.zone"],
    formats: ["image/webp", "image/avif"], // Use modern image formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // Optimize for common screen sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Icon and thumbnail sizes
  },

  // Enable bundle analyzer in development
  webpack: (config, { isServer }) => {
    // Optimize bundle splitting
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: "vendor",
            chunks: "all",
            test: /node_modules/,
            priority: 20,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
