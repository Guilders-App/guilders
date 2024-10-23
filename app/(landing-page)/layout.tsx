import "@/app/globals.css";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <nav className="w-full flex justify-center h-16 bg-background text-primary">
        <div className="w-full max-w-7xl flex items-center p-3 px-5 relative">
          <div className="absolute left-5">
            <Link href="/" className="text-xl font-bold">
              Guilders
            </Link>
          </div>
          <div className="flex-grow flex justify-center">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link href="/features" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Features
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/pricing" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/about" legacyBehavior passHref>
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                    >
                      About
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="absolute right-5 flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Login</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
          </div>
        </div>
      </nav>
      <div className="flex flex-col gap-20 max-w-5xl p-5">{children}</div>
    </main>
  );
}
