"use client";

import { useEffect, useMemo, useState } from "react";

import { motion } from "motion/react";

import { Button } from "@/components/ui/button";
import { MoveRight } from "lucide-react";
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
    <div className="w-full min-h-[calc(100vh-5rem)]">
      <div className="container mx-auto h-full">
        <div className="flex gap-4 py-20 lg:py-40 items-center justify-center flex-col h-full">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              Free for Early Adopters <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">Make your finances</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
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
              insights and personalized recommendations to optimize your wealth.
            </p>
          </div>
          {/* <div className="flex flex-row gap-3">
            <Link href={process.env.NEXT_PUBLIC_CAL_URL}>
              <Button size="lg" variant="outline">
                Jump on a call <PhoneCall className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg">
                Sign up here <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div> */}
          <NewsletterForm className="px-8" />
        </div>
      </div>
    </div>
  );
};
