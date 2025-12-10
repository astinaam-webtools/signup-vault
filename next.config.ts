import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  // Configure external packages for server components
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
};

export default nextConfig;
