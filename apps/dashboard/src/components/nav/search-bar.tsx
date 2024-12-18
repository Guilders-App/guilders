"use client";

import { Button } from "@guilders/ui/button";
import { cn } from "@guilders/ui/cn";
import { Search } from "lucide-react";
import { useDialog } from "../../lib/hooks/useDialog";

export function SearchBar() {
  const { open } = useDialog("command");

  return (
    <Button
      variant="outline"
      className={cn(
        "relative h-9 w-9 p-0 lg:h-10 lg:w-64 lg:justify-start lg:px-3 lg:py-2",
        "bg-background hover:bg-accent hover:text-accent-foreground",
        "text-muted-foreground",
        "border border-input",
        "ring-offset-background",
        "transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
      onClick={() => open({ pages: [] })}
    >
      <Search className="h-4 w-4 lg:mr-2 shrink-0" />
      <span className="hidden lg:inline-flex">Search...</span>
      <kbd className="hidden lg:inline-flex h-5 items-center rounded border border-border bg-background px-1.5 font-[inherit] text-[0.750rem] font-medium text-muted-foreground/70 ml-auto">
        ⌘K
      </kbd>
    </Button>
  );
}
