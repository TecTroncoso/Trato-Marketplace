import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@trato/shared"],
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
