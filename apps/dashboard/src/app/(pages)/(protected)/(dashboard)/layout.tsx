import { AppTopBar } from "@/apps/web/components/nav/app-top-bar";
import { SidebarInset } from "@/apps/web/components/ui/sidebar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarInset>
      <AppTopBar />
      <main className="flex-1 flex flex-col px-8 bg-muted/40">{children}</main>
    </SidebarInset>
  );
}
