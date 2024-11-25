import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Guilders Bucket
      {
        hostname: "evolcpeagtzeheagxreb.supabase.co",
      },
      // SnapTrade
      {
        hostname: "passiv-brokerage-logos.s3.ca-central-1.amazonaws.com",
      },
      {
        hostname: "storage.googleapis.com",
      },
      // SaltEdge
      {
        hostname: "d1uuj3mi6rzwpm.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
