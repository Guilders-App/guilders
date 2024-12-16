"use client";

import "@/app/globals.css";
import { Footer } from "@/apps/web/components/landing-page/footer";

import { Header } from "@/apps/web/components/landing-page/header";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-col items-center">
      <Header />
      <div className="flex flex-col gap-20 max-w-5xl p-5 mt-20 min-h-screen">
        {children}
      </div>
      <Footer />
    </main>
  );
}
