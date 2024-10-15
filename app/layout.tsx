import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import "./globals.css";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <nav className="w-full flex justify-center h-16 bg-background text-primary">
              <div className="w-full max-w-7xl flex items-center p-3 px-5 relative">
                <div className="absolute left-5">
                  <Link href="/" className="text-xl font-bold">
                    Koi
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
        </ThemeProvider>
      </body>
    </html>
  );
}
