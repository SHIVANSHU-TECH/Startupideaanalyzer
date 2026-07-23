import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose', 'bcryptjs', 'jsonwebtoken'],
  experimental: {
    turbo: {
      rules: {
        '*.js': ['next-swc-loader'],
      },
    },
  },
};

export default nextConfig;
