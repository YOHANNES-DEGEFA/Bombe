/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/watch',
        has: [{ type: 'query', key: 'movie_id', value: '(?<id>\\d+)' }],
        destination: '/movie/:id',
        permanent: true,
      },
      {
        source: '/watchTv',
        has: [{ type: 'query', key: 'tv_id', value: '(?<id>\\d+)' }],
        destination: '/watchTv/:id/1/1',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/t/p/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
        port: '',
        pathname: '/avatar/**',
      },
    ],
  },
};

module.exports = nextConfig;
