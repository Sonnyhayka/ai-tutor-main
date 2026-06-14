import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = isVercel
  ? {}
  : {
      output: "standalone",
      outputFileTracingRoot: __dirname,
      turbopack: {
        root: __dirname,
      },
    };

export default nextConfig;
