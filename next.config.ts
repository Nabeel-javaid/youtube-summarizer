/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed Python external packages
  // Removed experimental block
  async headers() {
    return [
      {
        // Basic CORS headers for API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Adjust origin in production if needed
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,POST' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' }, // Simplified headers
        ],
      },
    ];
  },
  // Removed rewrites as they are likely not needed for standard App Router API routes
};

export default nextConfig;
