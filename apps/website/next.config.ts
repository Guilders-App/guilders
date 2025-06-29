import createMDX from "@next/mdx";
import type { NextConfig } from "next";

// Validate environment variables
import "@/env";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  transpilePackages: ["@guilders/ui"],
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
});

export default withMDX(nextConfig);
