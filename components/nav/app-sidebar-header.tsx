"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppSidebarHeader() {
  const { state, isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>{<SidebarTrigger />}</TooltipTrigger>
          <TooltipContent
            side="right"
            align="center"
            hidden={state !== "collapsed" || isMobile}
          >
            Toggle Sidebar
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
