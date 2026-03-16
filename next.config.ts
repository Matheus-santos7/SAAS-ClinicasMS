import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["better-auth"],
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
