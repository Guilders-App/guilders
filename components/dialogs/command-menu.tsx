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
import { useCountries } from "@/lib/hooks/useCountries";
import { useDialog } from "@/lib/hooks/useDialog";
import { useInstitutions } from "@/lib/hooks/useInstitutions";
import { useProviders } from "@/lib/hooks/useProviders";
import { CommandLoading } from "cmdk";
import { Banknote, Landmark, Link2, SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function CommandMenu() {
  const { isOpen, data, open, close, update } = useDialog("command");
  const { open: openManualAccount } = useDialog("addManualAccount");
  const { open: openAddTransaction } = useDialog("addTransaction");
  const { open: openLinkedAccount } = useDialog("addLinkedAccount");
  const { data: institutions, isLoading } = useInstitutions();
  const { data: providers } = useProviders();
  const { data: countriesData } = useCountries();
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

  const handleAddTransaction = () => {
    close();
    setTimeout(() => openAddTransaction(), 40);
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

  const filteredInstitutions = institutions?.filter((institution) => {
    if (!search) return true;

    const searchLower = search.toLowerCase();
    const countryName = institution.country
      ? countriesData?.countriesMap.get(institution.country) || "Global"
      : "Global";

    return (
      institution.name.toLowerCase().includes(searchLower) ||
      countryName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setTimeout(() => update({ pages: [] }), 80);
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
                  <CommandItem onSelect={handleAddTransaction}>
                    <Banknote className="mr-2 h-4 w-4" />
                    Add Transaction
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
                {filteredInstitutions?.map((institution) => (
                  <CommandItem
                    key={institution.id}
                    onSelect={() => handleAddLinkedAccount(institution)}
                  >
                    <div className="flex items-center gap-2">
                      <Image
                        src={institution.logo_url}
                        alt={`${institution.name} logo`}
                        width={24}
                        height={24}
                        className="rounded-sm"
                      />
                      <div className="flex flex-col justify-center">
                        <span className="text-md">{institution.name}</span>
                        <span className="text-xs text-muted-foreground leading-3">
                          {institution.country
                            ? countriesData?.countriesMap.get(
                                institution.country
                              ) || "Global"
                            : "Global"}{" "}
                          •{" "}
                          {providers?.find(
                            (p) => p.id === institution.provider_id
                          )?.name ?? "Unknown Provider"}
                        </span>
                      </div>
                    </div>
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
