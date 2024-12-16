"use client";

import { Dialogs } from "@/apps/web/components/dialogs/dialogs";
import { AppSidebar } from "@/apps/web/components/nav/app-sidebar";
import { SidebarProvider } from "@/apps/web/components/ui/sidebar";
import { Toaster } from "@/apps/web/components/ui/sonner";
import { ReactNode } from "react";

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
