"use client";

import { Button } from "@/components/ui/button";
import { useAddAccountDialog } from "@/hooks/use-dialog";
import { PlusIcon } from "lucide-react";

export const AddAccountButton = () => {
  const { setIsAddAccountOpen } = useAddAccountDialog();

  return (
    <>
      <Button onClick={() => setIsAddAccountOpen(true)}>
        <PlusIcon />
        Add
      </Button>
    </>
  );
};
