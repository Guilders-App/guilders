"use client";

import { Button } from "@/components/ui/button";
import { useDialog } from "@/hooks/useDialog";
import { PlusIcon } from "lucide-react";

export const AddAccountButton = () => {
  const { open } = useDialog("addManualAccount");

  return (
    <Button onClick={() => open()}>
      <PlusIcon />
      Add
    </Button>
  );
};
