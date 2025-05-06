import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Optional: If you decide to use actual Bengali characters in URLs (not recommended for slugs generally)
  // i18n: {
  //   locales: ['en', 'bn'], // Add 'bn' for Bengali
  //   defaultLocale: 'en', // Or 'bn' if preferred
  // },
};

export default nextConfig;
