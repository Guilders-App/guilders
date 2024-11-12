"use client";

import { CommandMenu } from "@/components/dialogs/command-menu";
import { Dialogs } from "@/components/dialogs/dialogs";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex-1 my-8 mx-16">{children}</main>
      <Toaster />
      <CommandMenu />
      <Dialogs />
    </SidebarProvider>
  );
};

export default ProtectedLayout;
