import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  serverExternalPackages: ['@excalidraw/excalidraw'],
};

export default nextConfig;
