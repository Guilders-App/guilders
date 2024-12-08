import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: {
    appIsrStatus: false,
  },
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
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
      // Vezgo
      {
        hostname: "app.wealthica.com",
      },
    ],
  },
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
