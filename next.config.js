/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for production deployment
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = ['pg'];
    }
    return config;
  },
  // Force webpack instead of turbopack for compatibility
  experimental: {
    turbo: {
      resolveExtension: ['.tsx', '.ts', '.jsx', '.js', '.mjs'],
    },
  },
};

export default nextConfig;
