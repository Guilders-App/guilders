"use client";

import { ThemeSwitcher } from "@/components/common/theme-switcher";
import { SearchBar } from "@/components/nav/search-bar";
import { UserButton } from "@/components/nav/user-button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getBreadcrumbs } from "@/lib/breadcrumbs";
import { usePathname } from "next/navigation";
import React from "react";

export function AppTopBar() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  return (
    <header className="sticky top-0 flex h-16 shrink-0 items-center justify-between gap-2 bg-muted/40 px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1 h-8 w-8" />
        <Separator orientation="vertical" className="mx-0.5 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.title}>
                <BreadcrumbItem className="hidden md:block">
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={breadcrumb.href}>
                      {breadcrumb.title}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && (
                  <BreadcrumbSeparator className="hidden md:block" />
                )}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex items-center gap-2">
        <SearchBar />
        <ThemeSwitcher />
        <UserButton />
      </div>
    </header>
  );
}
