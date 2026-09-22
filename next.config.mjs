/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qafdentalclinic.com',
      },
      {
        protocol: 'https',
        hostname: 'sarvdental.clinic',
      },
    ],
  },
};

export default nextConfig;
