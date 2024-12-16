"use client";

import { Card, CardHeader } from "@/apps/web/components/ui/card";
import Image from "next/image";
import NewsletterForm from "./newsletter-form";

export const Newsletter = () => {
  return (
    <Card className="max-w-2xl mx-auto border-none shadow-none py-10 px-4">
      <CardHeader className="space-y-0 flex flex-col items-center">
        <Image
          alt="Decorative bird graphic"
          draggable={false}
          loading="lazy"
          width={150}
          height={150}
          className="w-[150px] h-[150px] object-contain"
          src="/assets/newsletter_bird.png"
        />

        <div className="text-center space-y-2 mt-6">
          <h2 className="text-3xl font-bold text-foreground">
            Personal finance built for you
          </h2>
          <h2 className="text-3xl font-semibold bg-gradient-to-b from-black to-gray-300/80 bg-clip-text text-center leading-none text-transparent dark:from-white dark:to-slate-900/10">
            Coming soon
          </h2>
        </div>
      </CardHeader>

      <NewsletterForm className="px-16" />
    </Card>
  );
};
