"use client";

export function UmamiAnalytics() {
  if (!process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) return null;

  return (
    <script
      async
      src="https://analytics.umami.is/script.js"
      data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
    />
  );
}
