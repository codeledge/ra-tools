/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["config", "db", "eslint-config-custom", "next-auth-prisma-adapter", "ra-data-simple-prisma"],
};

module.exports = nextConfig;
