import { Providers } from "@/components/common/providers";
import { UmamiAnalytics } from "@/components/common/umami-analytics";
import "@guilders/ui/globals.css";
import { Toaster } from "@guilders/ui/sonner";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { defaultMetadata } from "./(pages)/metadata";

export const metadata = {
  ...defaultMetadata,
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
        <Toaster />
      </body>
    </html>
  );
}
