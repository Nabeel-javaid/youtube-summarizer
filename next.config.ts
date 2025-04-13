/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['./api/youtube_summarizer.py'],
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'youtube-summarizer.vercel.app'],
    },
  },
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
