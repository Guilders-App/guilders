import { FAQ } from "@/components/landing-page/faq";
import { Hero } from "@/components/landing-page/hero";
import { Newsletter } from "@/components/landing-page/newsletter";

export default function Index() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-background text-foreground">
      <Hero />
      <FAQ />
      <Newsletter />
    </main>
  );
}
