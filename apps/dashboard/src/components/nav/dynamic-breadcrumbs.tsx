"use client";

import {
  Breadcrumb as BreadcrumbComponent,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@guilders/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";
import { useAccount } from "../../lib/hooks/useAccounts";
import { navigationData } from "./app-sidebar";

export type Breadcrumb = {
  title: string;
  href?: string;
};

export function getBreadcrumbs(pathname: string): Breadcrumb[] {
  // Find matching nav item
  const allNavItems = [...navigationData.navMain, ...navigationData.navFooter];
  // Find the most specific matching route
  const currentItem = allNavItems
    .filter((item) => item.url && pathname.startsWith(item.url))
    .sort((a, b) => (b.url?.length || 0) - (a.url?.length || 0))[0];

  if (!currentItem) {
    // Handle dynamic routes
    if (
      pathname.startsWith("/accounts/") ||
      pathname.startsWith("/transactions/")
    ) {
      return [
        { title: "Dashboard", href: "/" },
        { title: "Accounts", href: "/accounts" },
        { title: "Loading..." }, // This will be replaced by the dynamic component
      ];
    }

    // Default fallback
    return [{ title: "Dashboard", href: "/" }];
  }

  // Build breadcrumb trail
  const breadcrumbs: Breadcrumb[] = [];

  // Add parent if it exists
  if (currentItem.breadcrumb?.parent) {
    breadcrumbs.push({
      title: currentItem.breadcrumb.parent.title,
      href: currentItem.breadcrumb.parent.href,
    });
  }

  // Add current page
  breadcrumbs.push({
    title: currentItem.title,
    href: currentItem.url,
  });

  return breadcrumbs;
}

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const accountId = pathname.startsWith("/accounts/")
    ? Number.parseInt(pathname.split("/").pop() ?? "0")
    : undefined;
  const { data: account } = useAccount(accountId ?? 0);
  let breadcrumbs = getBreadcrumbs(pathname);

  // Update breadcrumbs if we have account data
  if (accountId && account) {
    breadcrumbs = [
      { title: "Dashboard", href: "/" },
      { title: "Accounts", href: "/accounts" },
      { title: account.name },
    ];
  }

  return (
    <BreadcrumbComponent>
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
    </BreadcrumbComponent>
  );
}
