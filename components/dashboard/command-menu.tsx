"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useStore } from "@/lib/store";
import {
  Banknote,
  ConciergeBell,
  Folder,
  Landmark,
  LayoutDashboard,
  Link2,
  SquarePen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export function CommandMenu() {
  const isCommandMenuOpen = useStore((state) => state.isCommandMenuOpen);
  const setIsCommandMenuOpen = useStore((state) => state.setIsCommandMenuOpen);
  const setIsAddManualAccountOpen = useStore(
    (state) => state.setIsAddManualAccountOpen
  );

  const [pages, setPages] = React.useState<string[]>([]);
  const page = pages[pages.length - 1];

  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandMenuOpen(!isCommandMenuOpen);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleAddAccount = () => {
    setIsCommandMenuOpen(false);
    setTimeout(() => setIsAddManualAccountOpen(true), 40);
  };

  const handleNavigate = (path: string) => {
    setIsCommandMenuOpen(false);
    router.push(path);
  };

  return (
    <Dialog open={isCommandMenuOpen} onOpenChange={setIsCommandMenuOpen}>
      <DialogTitle className="hidden">Command Menu</DialogTitle>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              setPages((pages) => pages.slice(0, -1));
            }
          }}
        >
          {/* Hidden title for accessibility */}
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            {/* {isLoading && (
              <CommandLoading>Loading institutions...</CommandLoading>
            )} */}
            <CommandEmpty>No results found.</CommandEmpty>
            {!page && (
              <>
                <CommandGroup heading="Manage Data">
                  <CommandItem
                    onSelect={() => setPages([...pages, "add-account"])}
                  >
                    <Landmark className="mr-2 h-4 w-4" />
                    Add Account
                  </CommandItem>
                  <CommandItem disabled>
                    <Banknote className="mr-2 h-4 w-4" />
                    Add Transaction
                  </CommandItem>
                  <CommandItem disabled>
                    <Folder className="mr-2 h-4 w-4" />
                    Add Category
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Navigation">
                  <CommandItem onSelect={() => handleNavigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </CommandItem>
                  <CommandItem onSelect={() => handleNavigate("/advisor")}>
                    <ConciergeBell className="mr-2 h-4 w-4" />
                    Go to Advisor
                  </CommandItem>
                </CommandGroup>
              </>
            )}
            {page === "add-account" && (
              <>
                <CommandGroup>
                  <CommandItem onSelect={handleAddAccount}>
                    <SquarePen className="mr-2 h-4 w-4" />
                    Add Manual Account
                  </CommandItem>
                  <CommandItem
                    onSelect={() => setPages([...pages, "add-synced-account"])}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Add Synced Account
                  </CommandItem>
                </CommandGroup>
              </>
            )}
            {page === "add-synced-account" && (
              <>
                {/* {institutions.map((institution) => (
                  <CommandItem key={institution.institution_id}>
                    {institution.name}
                  </CommandItem>
                ))} */}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
