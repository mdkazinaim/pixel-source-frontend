import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    APP_HOST: process.env.APP_HOST || "",
    APP_PORT: process.env.APP_PORT || "",
    API_PREFIX: process.env.API_PREFIX || "",
  },
};

export default nextConfig;

