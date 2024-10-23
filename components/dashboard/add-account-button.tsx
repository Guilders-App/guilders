"use client";

import { useAddAccountDialog } from "@/hooks/use-dialog";
import { PlusIcon } from "lucide-react";
import { Button } from "../ui/button";

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
