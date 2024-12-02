import { navigationData } from "@/components/nav/app-sidebar";
import { useAccount } from "@/lib/hooks/useAccounts";

export type Breadcrumb = {
  title: string;
  href?: string;
};

export const getBreadcrumbs = (pathname: string): Breadcrumb[] => {
  // Find matching nav item
  const allNavItems = [...navigationData.navMain, ...navigationData.navFooter];
  const currentItem = allNavItems.find((item) => item.url === pathname);

  if (!currentItem) {
    // Handle dynamic routes
    if (pathname.startsWith("/accounts/")) {
      const accountId = pathname.split("/").pop();
      if (accountId) {
        const { data: account } = useAccount(parseInt(accountId));
        if (account) {
          return [
            { title: "Dashboard", href: "/dashboard" },
            { title: "Accounts", href: "/accounts" },
            { title: account.name },
          ];
        }
      }
    }

    // Default fallback
    return [{ title: "Dashboard", href: "/dashboard" }];
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
  });

  return breadcrumbs;
};
