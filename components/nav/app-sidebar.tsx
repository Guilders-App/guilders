"use client";

import {
  ChartNoAxesCombined,
  ConciergeBell,
  LayoutDashboard,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav/nav-main";
import { NavUser } from "@/components/nav/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppSidebarHeader } from "./app-sidebar-header";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/assets/user.png",
  },
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
      title: "Forecast",
      url: "/forecast",
      icon: ChartNoAxesCombined,
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
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
