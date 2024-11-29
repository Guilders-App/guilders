"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInstitutions } from "@/hooks/useInstitutions";
import { Institution } from "@/lib/db/types";
import { useStore } from "@/lib/store";
import { CommandLoading } from "cmdk";
import {
  Banknote,
  ConciergeBell,
  Folder,
  Landmark,
  LayoutDashboard,
  Link2,
  SquarePen,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CommandMenu() {
  const isCommandMenuOpen = useStore((state) => state.isCommandMenuOpen);
  const setIsCommandMenuOpen = useStore((state) => state.setIsCommandMenuOpen);
  const setIsAddManualAccountOpen = useStore(
    (state) => state.setIsAddManualAccountOpen
  );
  const setSelectedInstitution = useStore(
    (state) => state.setSelectedInstitution
  );
  const setIsAddLinkedAccountOpen = useStore(
    (state) => state.setIsAddLinkedAccountOpen
  );
  const { data: institutions, isLoading } = useInstitutions();

  const [pages, setPages] = useState<string[]>([]);
  const page = pages[pages.length - 1];
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Keyboard shortcut to open the command menu
  useEffect(() => {
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

  const handleAddLinkedAccount = (institution: Institution) => {
    setIsCommandMenuOpen(false);
    setSelectedInstitution(institution);
    setTimeout(() => setIsAddLinkedAccountOpen(true), 40);
  };

  const handleNavigate = (path: string) => {
    setIsCommandMenuOpen(false);
    router.push(path);
  };

  const changePage = (page: string) => {
    setPages([...pages, page]);
  };

  return (
    <Dialog open={isCommandMenuOpen} onOpenChange={setIsCommandMenuOpen}>
      <DialogTitle className="hidden">Command Menu</DialogTitle>
      <DialogContent
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          if (pages.length > 0) {
            setPages((pages) => pages.slice(0, -1));
          } else {
            setIsCommandMenuOpen(false);
          }
        }}
        className="overflow-hidden p-0 shadow-lg"
      >
        <DialogDescription className="hidden">
          Search for a command or search...
        </DialogDescription>
        <Command
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !search) {
              e.preventDefault();
              setPages((pages) => pages.slice(0, -1));
            }
          }}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          {/* Hidden title for accessibility */}
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {!page && (
              <>
                <CommandGroup heading="Manage Data">
                  <CommandItem onSelect={() => changePage("add-account")}>
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
                    onSelect={() => changePage("add-synced-account")}
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    Add Synced Account
                  </CommandItem>
                </CommandGroup>
              </>
            )}
            {page === "add-synced-account" && (
              <>
                {isLoading && (
                  <CommandLoading>Loading institutions...</CommandLoading>
                )}
                {institutions?.map((institution) => (
                  <CommandItem
                    key={institution.id}
                    onSelect={() => handleAddLinkedAccount(institution)}
                  >
                    <Image
                      src={institution.logo_url}
                      alt={`${institution.name} logo`}
                      width={24}
                      height={24}
                      className="mr-2 rounded-sm"
                    />
                    {institution.name}
                  </CommandItem>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
