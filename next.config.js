/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for production deployment
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = ['pg'];
    }
    return config;
  },
};

export default nextConfig;
