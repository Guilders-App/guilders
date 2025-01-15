import { Badge } from "@guilders/ui/badge";
import { BentoCard, BentoGrid } from "@guilders/ui/bento-grid";
import { Globe } from "@guilders/ui/globe";
import {
  BotMessageSquare,
  Globe2,
  Share2,
  TentTree,
  Wallet,
} from "lucide-react";
import { AIMessages } from "./ai-messages";
import { BudgetingVisual } from "./budgeting-visual";
import { IntegrationsBeam } from "./integrations-beam";

const features = [
  {
    Icon: TentTree,
    name: "Plan your early retirement",
    description:
      "We help you plan your early retirement by analyzing your finances.",
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
    description: "Supports 30+ countries and counting.",
    background: (
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <Globe className="-top-10" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>
    ),
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: Share2,
    name: "Integrations",
    description:
      "Supports 5000+ connections to banks, brokerages, crypto and more.",
    background: (
      <>
        <IntegrationsBeam className="absolute right-2 top-4 h-[300px] border-none" />
      </>
    ),
    className: "col-span-3 lg:col-span-2",
  },
  {
    Icon: BotMessageSquare,
    name: "AI-powered Advisor",
    description: "Your own personal financial advisor tailored to your needs.",
    background: (
      <>
        <AIMessages className="w-full border-none" />
      </>
    ),
    className: "col-span-3 row-span-2 lg:col-span-1",
  },
  {
    Icon: Wallet,
    name: "Smart Budgeting",
    description:
      "Track your spending patterns and get AI-powered insights to optimize your budget automatically.",
    background: (
      <>
        <BudgetingVisual />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </>
    ),
    className: "col-span-2 row-span-2",
  },
];

export async function Features() {
  return (
    <div className="container py-6 lg:py-12">
      <div className="flex flex-col gap-8 mb-8 text-center">
        <div>
          <Badge variant="outline">Features</Badge>
        </div>
        <div>
          <h4 className="text-3xl md:text-5xl tracking-tighter max-w-xl mx-auto font-regular">
            Everything you need money
          </h4>
          <p className="text-muted-foreground text-lg mt-2">
            From budgeting and planning to investing and more, all in one place
          </p>
        </div>
      </div>

      <BentoGrid className="max-w-5xl mx-auto">
        {features.map((feature) => (
          <BentoCard key={feature.name} {...feature} />
        ))}
      </BentoGrid>
    </div>
  );
}
