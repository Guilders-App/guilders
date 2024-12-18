"use client";

import { cn } from "@guilders/ui/cn";
import { Separator } from "@guilders/ui/separator";
import { SidebarTrigger } from "@guilders/ui/sidebar";
import { useEffect, useState } from "react";
import { SearchBar } from "../nav/search-bar";
import { UserButton } from "../nav/user-button";
import { DynamicBreadcrumbs } from "./dynamic-breadcrumbs";

export function AppTopBar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setIsScrolled(window.scrollY > 0);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky z-20 top-0 flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm"
          : "bg-muted/40",
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 h-8 w-8" />
        <Separator orientation="vertical" className="mx-0.5 h-4" />
        <DynamicBreadcrumbs />
      </div>
      <div className="flex items-center gap-2">
        <SearchBar />
        <UserButton />
      </div>
    </header>
  );
}
