import { AppTopBar } from "@/components/nav/app-top-bar";
import { SidebarInset } from "@guilders/ui/sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarInset>
      <AppTopBar />
      <main className="flex-1 flex flex-col px-8 bg-muted/40">{children}</main>
    </SidebarInset>
  );
}
