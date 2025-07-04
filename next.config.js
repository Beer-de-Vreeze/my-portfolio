/** @type {import('next').NextConfig} */
const nextConfig = {
  // Make sure there are no module format transformations causing issues
  output: "standalone", // Optimized for Vercel deployment
  poweredByHeader: false, // Remove X-Powered-By header
  reactStrictMode: true, // Enable React strict mode for improved development experience
  images: {
    domains: ["img.itch.zone"],
  },
};

export default nextConfig;
