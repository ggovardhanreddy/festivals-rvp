import type { NextConfig } from "next";

const repoBase = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: repoBase || undefined,
  assetPrefix: repoBase || undefined,
};

export default nextConfig;
