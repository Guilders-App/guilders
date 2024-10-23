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
import React from "react";

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const { setIsAddAccountOpen } = useAddAccountDialog();

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
    setTimeout(() => setIsAddAccountOpen(true), 80);
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Manage Data">
            <CommandItem onSelect={handleAddAccount}>Add Account</CommandItem>
            <CommandItem>Add Transaction</CommandItem>
            <CommandItem>Add Category</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Navigation">
            <CommandItem>Go to Dashboard</CommandItem>
            <CommandItem>Go to Accounts</CommandItem>
            <CommandItem>Go to Transactions</CommandItem>
            <CommandItem>Go to Categories</CommandItem>
            <CommandItem>Go to Settings</CommandItem>
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem>Export Data</CommandItem>
            <CommandItem>Import Data</CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
