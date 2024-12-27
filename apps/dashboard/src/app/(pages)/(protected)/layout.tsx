"use client";

import { Dialogs } from "@/components/dialogs/dialogs";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { AppTopBar } from "@/components/nav/app-top-bar";
import { SidebarInset, SidebarProvider } from "@guilders/ui/sidebar";
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
      <Dialogs />
    </SidebarProvider>
  );
};

export default ProtectedLayout;
