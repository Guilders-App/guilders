"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAddAccountDialog } from "@/hooks/use-dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import {
  Banknote,
  ConciergeBell,
  Folder,
  Landmark,
  LayoutDashboard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const { setIsAddAccountOpen } = useAddAccountDialog();
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleAddAccount = () => {
    setOpen(false);
    setTimeout(() => setIsAddAccountOpen(true), 40);
  };

  const handleNavigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        {/* Hidden title for accessibility */}
        <DialogTitle className="hidden">Command Menu</DialogTitle>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Manage Data">
            <CommandItem onSelect={handleAddAccount}>
              <Landmark className="mr-2 h-4 w-4" />
              Add Account
            </CommandItem>
            <CommandItem>
              <Banknote className="mr-2 h-4 w-4" />
              Add Transaction
            </CommandItem>
            <CommandItem>
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
        </CommandList>
      </CommandDialog>
    </>
  );
}
