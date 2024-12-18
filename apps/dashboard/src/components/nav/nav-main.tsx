"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Collapsible, CollapsibleTrigger } from "@guilders/ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@guilders/ui/sidebar";
import type { NavItem } from "./app-sidebar";

export function NavItems({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = item.url
          ? pathname === item.url || pathname.startsWith(`${item.url}/`)
          : false;

        return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                {item.url ? (
                  <Link href={item.url} className="w-full">
                    <SidebarMenuButton tooltip={item.title} isActive={isActive}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </Link>
                ) : (
                  <div onClick={item.onClick} className="w-full">
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </div>
                )}
              </CollapsibleTrigger>
            </SidebarMenuItem>
          </Collapsible>
        );
      })}
    </SidebarMenu>
  );
}
