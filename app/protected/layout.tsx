import { CommandMenu } from "@/components/dashboard/command-menu";
import { Dialogs } from "@/components/dashboard/dialogs";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import React from "react";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 my-8 mx-16">{children}</main>
      <Toaster />
      <CommandMenu />
      <Dialogs />
    </SidebarProvider>
  );
};

export default ProtectedLayout;
