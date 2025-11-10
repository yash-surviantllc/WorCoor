/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  // Disable image optimization for drag-and-drop functionality
  images: {
    unoptimized: true,
  },
  // Enable SWC minification
  swcMinify: true,
  // Experimental features for React 19
  experimental: {
    // Enable React 19 features
  },
  // Webpack configuration for backward compatibility
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

module.exports = nextConfig;
