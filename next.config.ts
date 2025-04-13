/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['./api/youtube_summarizer.py'],
  experimental: {
    // Removed serverActions block as it might not be relevant for standard API routes
  },
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' }, // Be cautious with '*' in production
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,POST' }, // Limit methods to what's needed
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  // Keep rewrites if they are necessary, but they might be redundant with standard App Router routing
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
