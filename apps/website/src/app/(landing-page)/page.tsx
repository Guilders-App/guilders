import { FAQ } from "@/components/faq";
import { Features } from "@/components/features";
import { Hero } from "@/components/hero";
import { Newsletter } from "@/components/newsletter";
import type { Metadata } from "next";
import { defaultMetadata } from "../metadata";

export const metadata: Metadata = defaultMetadata;

export default function Index() {
  return (
    <div className="flex flex-col items-center bg-background text-foreground w-full">
      <Hero />
      <Features />
      <FAQ />
      <Newsletter />
    </div>
  );
}
