import { BentoCard, BentoGrid } from "@guilders/ui/bento-grid";
import { Globe } from "@guilders/ui/globe";
import { BotMessageSquare, Globe2, Share2, TentTree } from "lucide-react";
import { AIMessages } from "./ai-messages";
import { IntegrationsBeam } from "./integrations-beam";

const features = [
  {
    Icon: TentTree,
    name: "Plan your early retirement",
    description:
      "We help you plan your early retirement by analyzing your financial situation.",
    href: "/sign-up",
    cta: "Get started",
    background: (
      <img
        alt="Tent Illustration"
        className="absolute -right-20 -top-20 opacity-60"
      />
    ),
    className: "col-span-3 lg:col-span-1",
  },
  {
    Icon: Globe2,
    name: "Global Coverage",
    description: "Supports 100+ countries and counting.",
    href: "/sign-up",
    cta: "Get started",
    background: (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <Globe className="-top-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-background/0" />
      </div>
    ),
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: Share2,
    name: "Integrations",
    description:
      "Supports 5000+ connections to banks, brokerages, crypto and more.",
    href: "/sign-up",
    cta: "Get started",
    background: (
      <IntegrationsBeam className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: BotMessageSquare,
    name: "AI-powered Advisor",
    description: "Your own personal financial advisor tailored to your needs.",
    href: "/sign-up",
    cta: "Get started",
    background: (
      <AIMessages className="absolute right-2 top-0 h-[300px] w-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
    className: "col-span-3 lg:col-span-1",
  },
];

export async function Features() {
  return (
    <BentoGrid className="grid-rows-3 h-screen">
      {features.map((feature) => (
        <BentoCard key={feature.name} {...feature} />
      ))}
    </BentoGrid>
  );
}
