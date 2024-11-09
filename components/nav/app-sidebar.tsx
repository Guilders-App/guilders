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

import { signOutAction } from "@/app/actions";
import { NavItems } from "@/components/nav/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppSidebarHeader } from "./app-sidebar-header";

const data = {
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
    },
    {
      title: "Accounts",
      url: "/accounts",
      icon: Briefcase,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: ArrowRightLeft,
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
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <NavItems items={data.navMain} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavItems items={data.navFooter} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
