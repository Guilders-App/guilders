import { FAQ } from "@/src/components/faq";
import { Features } from "@/src/components/features";
import { Hero } from "@/src/components/hero";
import { Newsletter } from "@/src/components/newsletter";
import type { Metadata } from "next";
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
