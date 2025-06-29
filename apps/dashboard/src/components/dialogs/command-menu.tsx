"use client";

import { bottomNavigation, mainNavigation } from "@/lib/config/navigation";
import { useDialog } from "@/lib/hooks/useDialog";
import { useCountriesMap } from "@/lib/queries/useCountries";
import { useInstitutions } from "@/lib/queries/useInstitutions";
import { useProviders } from "@/lib/queries/useProviders";
import type { Institution } from "@guilders/api/types";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@guilders/ui/command";
import { CommandLoading } from "cmdk";
import { Banknote, Landmark, Link2, SquarePen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export function CommandMenu() {
  const { isOpen, data, open, close, update } = useDialog("command");
  const { open: openManualAccount } = useDialog("addManualAccount");
  const { open: openAddTransaction } = useDialog("addTransaction");
  const { open: openLinkedAccount } = useDialog("addLinkedAccount");
  const { data: institutions, isLoading } = useInstitutions();
  const { data: providers } = useProviders();
  const countriesMap = useCountriesMap();
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
    setTimeout(() => {
      setSearch("");
      openManualAccount();
    }, 40);
  };

  const handleAddTransaction = () => {
    close();
    setTimeout(() => {
      setSearch("");
      openAddTransaction({});
    }, 40);
  };

  const handleAddLinkedAccount = (institution: Institution) => {
    close();
    setTimeout(() => {
      setSearch("");
      openLinkedAccount({ institution });
    }, 40);
  };

  const handleNavigate = (path: string) => {
    close();
    setSearch("");
    router.push(path);
  };

  const changePage = (newPage: string) => {
    update({
      pages: [...pages, newPage],
    });
  };

  const currentPage = pages[pages.length - 1];

  const allInstitutions = institutions || [];
  const filteredInstitutions = useMemo(() => {
    return allInstitutions.filter((institution) => {
      if (!search) return true;

      const searchTerms = search.toLowerCase().trim().split(/\s+/);
      const countryName = institution.country
        ? countriesMap?.[institution.country] || "Global"
        : "Global";

      // Check if all search terms are found in either name or country
      return searchTerms.every(
        (term) =>
          institution.name.toLowerCase().includes(term) ||
          countryName.toLowerCase().includes(term),
      );
    });
  }, [search, allInstitutions, countriesMap]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
      setSearch("");
      // Reset pages after a short delay to allow for closing animation
      setTimeout(() => update({ pages: [] }), 80);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle backspace when search is empty
    if (e.key === "Backspace" && !search) {
      e.preventDefault();
      if (pages.length > 0) {
        update({
          pages: pages.slice(0, -1),
        });
      }
    } else if (e.key === "Escape") {
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
    }
  };

  return (
    <CommandDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      commandProps={{
        onKeyDown: handleKeyDown,
        shouldFilter: currentPage !== "add-synced-account",
      }}
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
              {[...mainNavigation, ...bottomNavigation]
                .filter((item) => item.href)
                .map((item) => (
                  <CommandItem
                    key={item.name}
                    onSelect={() => handleNavigate(item.href ?? "")}
                  >
                    {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                    Go to {item.name}
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
        {currentPage === "add-account" && (
          <CommandGroup>
            <CommandItem onSelect={handleAddAccount}>
              <SquarePen className="mr-2 h-4 w-4" />
              Add Manual Account
            </CommandItem>
            <CommandItem onSelect={() => changePage("add-synced-account")}>
              <Link2 className="mr-2 h-4 w-4" />
              Add Synced Account
            </CommandItem>
          </CommandGroup>
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
                        ? countriesMap?.[institution.country] || "Global"
                        : "Global"}{" "}
                      •{" "}
                      {providers?.find((p) => p.id === institution.provider_id)
                        ?.name ?? "Unknown Provider"}
                    </span>
                  </div>
                </div>
              </CommandItem>
            ))}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
