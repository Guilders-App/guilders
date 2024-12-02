"use client";

import { navigationData } from "@/components/nav/app-sidebar";
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
import { Institution } from "@/lib/db/types";
import { useDialog } from "@/lib/hooks/useDialog";
import { useInstitutions } from "@/lib/hooks/useInstitutions";
import { CommandLoading } from "cmdk";
import { Banknote, Folder, Landmark, Link2, SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CommandMenu() {
  const { isOpen, data, open, close, update } = useDialog("command");
  const { open: openManualAccount } = useDialog("addManualAccount");
  const { open: openLinkedAccount } = useDialog("addLinkedAccount");
  const { data: institutions, isLoading } = useInstitutions();
  const [search, setSearch] = useState("");
  const router = useRouter();

  const pages = data?.pages ?? [];

  // Keyboard shortcut to open the command menu
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (isOpen) {
          close();
        } else {
          open({ pages: [] });
        }
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [isOpen, open, close]);

  const handleAddAccount = () => {
    close();
    setTimeout(() => openManualAccount(), 40);
  };

  const handleAddLinkedAccount = (institution: Institution) => {
    close();
    setTimeout(() => openLinkedAccount({ institution }), 40);
  };

  const handleNavigate = (path: string) => {
    close();
    router.push(path);
  };

  const changePage = (newPage: string) => {
    update({
      pages: [...pages, newPage],
    });
  };

  const currentPage = pages[pages.length - 1];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          open({ pages: [] });
        } else {
          close();
        }
      }}
    >
      <DialogTitle className="hidden">Command Menu</DialogTitle>
      <DialogContent
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          if (pages.length > 0) {
            setSearch("");
            update({
              pages: pages.slice(0, -1),
            });
          } else {
            setSearch("");
            close();
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
              if (pages.length > 0) {
                update({
                  pages: pages.slice(0, -1),
                });
              }
            }
          }}
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5"
        >
          <CommandInput
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {!currentPage && (
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
                  {[...navigationData.navMain, ...navigationData.navFooter]
                    .filter((item) => item.url)
                    .map((item) => (
                      <CommandItem
                        key={item.title}
                        onSelect={() => handleNavigate(item.url!)}
                      >
                        {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                        Go to {item.title}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </>
            )}
            {currentPage === "add-account" && (
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
            {currentPage === "add-synced-account" && (
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
