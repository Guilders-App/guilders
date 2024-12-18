"use client";

import { cn } from "@guilders/ui/cn";
import { ScrollArea, ScrollBar } from "@guilders/ui/scroll-area";
import { CreditCard, Key, Satellite, Shield, UserCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SettingsTabsProps extends React.HTMLAttributes<HTMLElement> {
  items: {
    href: string;
    title: string;
  }[];
}

export function SettingsTabs({
  className,
  items,
  ...props
}: SettingsTabsProps) {
  const pathname = usePathname();

  const getIcon = (title: string) => {
    switch (title) {
      case "Account":
        return (
          <UserCircle
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            strokeWidth={2}
          />
        );
      case "Security":
        return (
          <Shield
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            strokeWidth={2}
          />
        );
      case "Connections":
        return (
          <Satellite
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            strokeWidth={2}
          />
        );
      case "API Key":
        return (
          <Key
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            strokeWidth={2}
          />
        );
      case "Subscription":
        return (
          <CreditCard
            className="-ms-0.5 me-1.5 opacity-60"
            size={16}
            strokeWidth={2}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ScrollArea>
      <nav
        className={cn(
          "mb-3 flex h-auto gap-2 rounded-none border-b border-border bg-transparent px-0 py-1 text-foreground",
          className,
        )}
        {...props}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium relative transition-colors",
              "after:absolute after:inset-x-0 after:bottom-0 after:-mb-1 after:h-0.5",
              "hover:bg-accent hover:text-foreground",
              pathname === item.href
                ? "text-foreground after:bg-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {getIcon(item.title)}
            {item.title}
          </Link>
        ))}
      </nav>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
