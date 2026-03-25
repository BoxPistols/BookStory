import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  transpilePackages: ["@bookstory/core"],
  // GitHub Pages 用の静的エクスポート
  ...(isGitHubPages && {
    output: "export",
    basePath: process.env.BASE_PATH || "",
    images: { unoptimized: true },
  }),
};

export default nextConfig;
