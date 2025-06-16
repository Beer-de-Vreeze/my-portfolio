/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make sure there are no module format transformations causing issues
  output: "standalone", // Optimized for Vercel deployment
  poweredByHeader: false, // Remove X-Powered-By header
  swcMinify: true, // Use SWC for minification (faster than Terser)
  reactStrictMode: true, // Enable React strict mode for improved development experience
};

export default nextConfig;
