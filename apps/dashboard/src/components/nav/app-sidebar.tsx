"use client";

import { useStore } from "@/lib/store";
import { cn } from "@guilders/ui/cn";
import Image from "next/image";
import Link from "next/link";
import { MainMenu } from "./mainmenu";

export function AppSidebar() {
  const isOpen = useStore((state) => state.isOpen);
  const closeMenu = useStore((state) => state.closeMenu);

  return (
    <>
      {/* Backdrop - only on mobile when menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "h-screen w-16 flex-shrink-0 flex flex-col fixed top-0 left-0 z-50",
          // Different background based on screen size
          "bg-muted md:bg-muted/40",
          // Only apply transform on mobile
          "md:transform-none",
          "transition-transform duration-200",
          !isOpen && "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="h-9 flex items-center justify-end pr-3 mt-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo/logo.svg"
              alt="Guilders Logo"
              height={36}
              width={36}
              priority
            />
          </Link>
        </div>

        <MainMenu />
      </aside>
    </>
  );
}
