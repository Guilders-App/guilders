"use client";

import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Command, Search } from "lucide-react";

export function SearchBar() {
  const setIsCommandMenuOpen = useStore((state) => state.setIsCommandMenuOpen);

  return (
    <Button
      variant="outline"
      className={cn(
        "relative h-9 w-9 p-0 xl:h-10 xl:w-64 xl:justify-start xl:px-3 xl:py-2",
        "bg-background hover:bg-accent hover:text-accent-foreground",
        "text-muted-foreground",
        "border border-input",
        "ring-offset-background",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      )}
      onClick={() => setIsCommandMenuOpen(true)}
    >
      <Search className="h-4 w-4 xl:mr-2 shrink-0" />
      <span className="hidden xl:inline-flex">Search...</span>
      <div className="hidden xl:inline-flex items-center gap-1 rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground ml-auto">
        <Command className="h-3 w-3" />
        <span className="text-xs">K</span>
      </div>
    </Button>
  );
}
