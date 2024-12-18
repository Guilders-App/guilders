"use client";

import { Dialogs } from "@/components/dialogs/dialogs";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { AppTopBar } from "@/components/nav/app-top-bar";
import { SidebarInset, SidebarProvider } from "@guilders/ui/sidebar";
import { Toaster } from "@guilders/ui/sonner";
import type { ReactNode } from "react";

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset>
        <AppTopBar />
        <main className="flex-1 flex flex-col px-8 bg-muted/40 min-h-screen">
          {children}
        </main>
      </SidebarInset>
      <Toaster />
      <Dialogs />
    </SidebarProvider>
  );
};

export default ProtectedLayout;
