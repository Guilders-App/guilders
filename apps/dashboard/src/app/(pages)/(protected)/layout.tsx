"use client";

import { Dialogs } from "@/components/dialogs/dialogs";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { SidebarProvider } from "@guilders/ui/sidebar";
import { Toaster } from "@guilders/ui/sonner";
import type { ReactNode } from "react";

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen">{children}</main>
      <Toaster />
      <Dialogs />
    </SidebarProvider>
  );
};

export default ProtectedLayout;
