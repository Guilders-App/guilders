import { FAQ } from "@/apps/web/components/landing-page/faq";
import { Features } from "@/apps/web/components/landing-page/features";
import { Hero } from "@/apps/web/components/landing-page/hero";
import { Newsletter } from "@/apps/web/components/landing-page/newsletter";
import { Metadata } from "next";
import { defaultMetadata } from "../metadata";

export const metadata: Metadata = defaultMetadata;

export default function Index() {
  return (
    <main className="flex flex-col items-center bg-background text-foreground">
      <Hero />
      <Features />
      <FAQ />
      <Newsletter />
    </main>
  );
}
