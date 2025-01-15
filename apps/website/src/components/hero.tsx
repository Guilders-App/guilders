"use client";

import { AuroraBackground } from "@guilders/ui/aurora-background";
import { Badge } from "@guilders/ui/badge";
import { MoveRight } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import NewsletterForm from "./newsletter-form";

export const Hero = () => {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(() => ["smart", "personal", "simple"], []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <AuroraBackground className="w-full">
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-10"
      >
        <div className="min-h-[calc(100vh-5rem)]">
          <div className="container mx-auto h-full">
            <div className="flex gap-4 py-20 lg:py-40 items-center justify-center flex-col h-full">
              <Badge
                variant="secondary"
                className="gap-2 bg-background/50 backdrop-blur-sm hover:bg-background/60 p-2"
              >
                Free for Early Adopters <MoveRight className="w-4 h-4" />
              </Badge>
              <div className="flex gap-4 flex-col">
                <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular text-foreground">
                  <span className="text-spektr-cyan-50">
                    Make your finances
                  </span>
                  <span className="relative h-20 flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                    {titles.map((title, index) => (
                      <motion.span
                        key={title}
                        className="absolute font-semibold text-foreground"
                        initial={{ opacity: 0, y: "-100" }}
                        transition={{ type: "spring", stiffness: 100 }}
                        animate={
                          titleNumber === index
                            ? {
                                y: 0,
                                opacity: 1,
                              }
                            : {
                                y: titleNumber > index ? -150 : 150,
                                opacity: 0,
                              }
                        }
                      >
                        {title}
                      </motion.span>
                    ))}
                  </span>
                </h1>

                <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
                  Your personal AI financial advisor. Guilders connects all your
                  bank accounts and investments in one place, providing smart
                  insights and personalized recommendations to optimize your
                  wealth.
                </p>
              </div>

              <NewsletterForm className="px-8" />
            </div>
          </div>
        </div>
      </motion.div>
    </AuroraBackground>
  );
};
