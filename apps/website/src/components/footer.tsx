import { Button } from "@guilders/ui/button";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-4 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Guilders. All rights reserved.
          </p>
        </div>
        <div className="md:ml-auto">
          <div className="flex gap-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/terms-of-service">Terms of Service</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/privacy-policy">Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
