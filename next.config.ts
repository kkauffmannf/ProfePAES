import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    BEDROCK_ACCESS_KEY_ID: process.env.BEDROCK_ACCESS_KEY_ID,
    BEDROCK_SECRET_ACCESS_KEY: process.env.BEDROCK_SECRET_ACCESS_KEY,
    BEDROCK_REGION: process.env.BEDROCK_REGION,
  },
};

export default nextConfig;
