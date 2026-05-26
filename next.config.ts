import type { NextConfig } from "next";
import {
  getSecurityHeaders,
  getServerActionAllowedOrigins,
} from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    serverActions: {
      allowedOrigins: getServerActionAllowedOrigins(),
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: getSecurityHeaders(),
      },
    ];
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
