/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable Turbopack (use Webpack instead) to avoid BMI2 CPU instruction errors
  turbopack: {
    // Turbopack is disabled by setting this to false
    enabled: false,
  },
};

export default nextConfig;
