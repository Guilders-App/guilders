"use client";

import { env } from "@/env";

export function UmamiAnalytics() {
  if (!env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) return null;
  if (env.NODE_ENV === "development") return null;

  return (
    <script
      async
      src="https://analytics.umami.is/script.js"
      data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
    />
  );
}
