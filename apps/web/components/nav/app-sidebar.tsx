"use client";

import {
  ArrowRightLeft,
  Briefcase,
  ConciergeBell,
  LayoutDashboard,
  LogOut,
  Settings,
} from "lucide-react";
import * as React from "react";

import { signOutAction } from "@/apps/web/app/actions";
import { NavItems } from "@/apps/web/components/nav/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarRail,
} from "@/apps/web/components/ui/sidebar";

export type NavItem = {
  title: string;
  url?: string;
  icon?: React.ElementType;
  isActive?: boolean;
  onClick?: () => void;
  breadcrumb?: {
    parent?: { title: string; href: string };
  };
};

export const navigationData: {
  navMain: NavItem[];
  navFooter: NavItem[];
} = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Advisor",
      url: "/advisor",
      icon: ConciergeBell,
      breadcrumb: {
        parent: { title: "Dashboard", href: "/dashboard" },
      },
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: Briefcase,
      breadcrumb: {
        parent: { title: "Dashboard", href: "/dashboard" },
      },
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: ArrowRightLeft,
      breadcrumb: {
        parent: { title: "Dashboard", href: "/dashboard" },
      },
    },
  ],
  navFooter: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Log Out",
      icon: LogOut,
      onClick: signOutAction,
    },
  ],
} as const;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <NavItems items={navigationData.navMain} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavItems items={navigationData.navFooter} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
