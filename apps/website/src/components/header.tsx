"use client";

import { Button } from "@guilders/ui/button";
import { cn } from "@guilders/ui/cn";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavigationItem = {
  title: string;
  href?: string;
  description?: string;
  items?: NavigationItem[];
};

const navigationItems: NavigationItem[] = [
  // {
  //   title: "Company",
  //   description: ".",
  //   items: [
  //     {
  //       title: "About us",
  //       href: "/about",
  //     },
  //     {
  //       title: "Fundraising",
  //       href: "/fundraising",
  //     },
  //     {
  //       title: "Investors",
  //       href: "/investors",
  //     },
  //     {
  //       title: "Contact us",
  //       href: "/contact",
  //     },
  //   ],
  // },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "w-full z-40 fixed top-0 left-0 transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm"
          : "bg-background/40",
      )}
    >
      <div className="container relative mx-auto min-h-16 flex gap-4 flex-row items-center justify-between">
        <div className="flex justify-start">
          <Link href="/">
            <Image
              src="/assets/logo/logo_text.svg"
              alt="Guilders Logo"
              height={24}
              width={120}
              priority
            />
          </Link>
        </div>
        <div className="flex justify-end gap-4">
          <Link
            href={process.env.NEXT_PUBLIC_CAL_URL}
            aria-label="Book a demo call"
          >
            <Button variant="ghost" className="hidden md:inline">
              Book a demo
            </Button>
          </Link>
          <div className="border-r hidden md:inline" />
          <Link href="/sign-in">
            <Button variant="outline">Sign in</Button>
          </Link>
          {/* <Link href="/sign-up">
            <Button>Get started</Button>
          </Link> */}
        </div>
      </div>
    </header>
  );
};
