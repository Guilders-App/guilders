import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type NavigationItem = {
  title: string;
  href?: string;
  description?: string;
  items?: NavigationItem[];
};

const navigationItems: NavigationItem[] = [
  {
    title: "Home",
    href: "/",
    description: "",
  },
  // {
  //   title: "Company",
  //   description: ".",
  //   items: [
  //     {
  //       title: "About us",
  //       href: "/about",
  //     },
  //     {
  //       title: "Fundraising",
  //       href: "/fundraising",
  //     },
  //     {
  //       title: "Investors",
  //       href: "/investors",
  //     },
  //     {
  //       title: "Contact us",
  //       href: "/contact",
  //     },
  //   ],
  // },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "w-full z-40 fixed top-0 left-0 transition-all duration-200",
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 shadow-sm"
          : "bg-background/40"
      )}
    >
      <div className="container relative mx-auto min-h-16 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
        <div className="justify-start items-center gap-4 lg:flex hidden flex-row">
          <NavigationMenu className="flex justify-start items-start">
            <NavigationMenuList className="flex justify-start gap-4 flex-row">
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.title}>
                  {item.href ? (
                    <>
                      <NavigationMenuLink href={item.href}>
                        <Button variant="ghost">{item.title}</Button>
                      </NavigationMenuLink>
                    </>
                  ) : (
                    <>
                      <NavigationMenuTrigger className="font-medium text-sm">
                        {item.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="!w-[450px] p-4">
                        <div className="flex flex-col lg:grid grid-cols-2 gap-4">
                          <div className="flex flex-col h-full justify-between">
                            <div className="flex flex-col">
                              <p className="text-base">{item.title}</p>
                              <p className="text-muted-foreground text-sm">
                                {item.description}
                              </p>
                            </div>
                            <Button size="sm" className="mt-10">
                              Book a call today
                            </Button>
                          </div>
                          <div className="flex flex-col text-sm h-full justify-end">
                            {item.items?.map((subItem) => (
                              <NavigationMenuLink
                                href={subItem.href}
                                key={subItem.title}
                                className="flex flex-row justify-between items-center hover:bg-muted py-2 px-4 rounded"
                              >
                                <span>{subItem.title}</span>
                                <MoveRight className="w-4 h-4 text-muted-foreground" />
                              </NavigationMenuLink>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex lg:justify-center">
          <Link href="/">
            <Image
              src="/assets/logo/logo_text.svg"
              alt="Guilders Logo"
              width={180}
              height={42}
              priority
            />
          </Link>
        </div>
        <div className="flex justify-end w-full gap-4">
          <Link href={process.env.NEXT_PUBLIC_CAL_URL}>
            <Button variant="ghost" className="hidden md:inline">
              Book a demo
            </Button>
          </Link>
          <div className="border-r hidden md:inline"></div>
          <Link href="/sign-in">
            <Button variant="outline">Sign in</Button>
          </Link>
          {/* <Link href="/sign-up">
            <Button>Get started</Button>
          </Link> */}
        </div>
      </div>
    </header>
  );
};
