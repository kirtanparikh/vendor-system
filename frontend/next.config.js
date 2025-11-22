/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disabling strict mode can help with some d3 interaction bugs
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
