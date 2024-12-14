export function UmamiAnalytics() {
  return (
    process.env.NODE_ENV === "production" && (
      <script
        defer
        src="https://cloud.umami.is/script.js"
        data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
      />
    )
  );
}
