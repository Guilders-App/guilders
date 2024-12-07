import { FAQ } from "@/components/landing-page/faq";
import { Hero } from "@/components/landing-page/hero";
import { Newsletter } from "@/components/landing-page/newsletter";
import { Metadata } from "next";
import { defaultMetadata } from "../metadata";

export const metadata: Metadata = defaultMetadata;

export default function Index() {
  return (
    <main className="flex flex-col items-center bg-background text-foreground">
      <Hero />
      <FAQ />
      <Newsletter />
    </main>
  );
}
