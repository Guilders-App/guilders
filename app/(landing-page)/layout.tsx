"use client";

import "@/app/globals.css";
import { Footer } from "@/components/landing-page/footer";

import { Header } from "@/components/landing-page/header";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Header />
      <div className="flex flex-col gap-20 max-w-5xl p-5 mt-20">{children}</div>
      <Footer />
    </main>
  );
}
