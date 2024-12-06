"use client";

import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { SearchBar } from "@/components/nav/search-bar";
import { UserButton } from "@/components/nav/user-button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { DynamicBreadcrumbs } from "./dynamic-breadcrumbs";

export function AppTopBar() {
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
        "sticky z-20 top-0 flex h-16 shrink-0 items-center justify-between gap-2 px-4 transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm"
          : "bg-muted/40"
      )}
    >
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 h-8 w-8" />
        <Separator orientation="vertical" className="mx-0.5 h-4" />
        <DynamicBreadcrumbs />
      </div>
      <div className="flex items-center gap-2">
        <SearchBar />
        <ThemeSwitcher />
        <UserButton />
      </div>
    </header>
  );
}
