"use client";

import Image from "next/image";
import Link from "next/link";
import { MainMenu } from "./mainmenu";

export function AppSidebar() {
  return (
    <aside className="h-screen w-[280px] md:w-[70px] bg-muted/40 flex-shrink-0 flex flex-col fixed top-0 left-0">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logo/logo.svg"
            alt="Guilders Logo"
            height={36}
            width={36}
            priority
          />
        </Link>
      </div>

      {/* Main Navigation */}
      <MainMenu />
    </aside>
  );
}
