import { Providers } from "@/apps/web/components/common/providers";
import { UmamiAnalytics } from "@/apps/web/components/common/umami-analytics";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { defaultMetadata } from "./(pages)/metadata";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  ...defaultMetadata,
  metadataBase: new URL(defaultUrl),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <UmamiAnalytics />
      </head>
      <body className="bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
