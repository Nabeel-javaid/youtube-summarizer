/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['./api/youtube_summarizer.py'],
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
